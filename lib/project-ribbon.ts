import * as THREE from "three";
import { allProjects, type Project } from "./content";
import { projectCovers, projectCoverPositions } from "./project-galleries";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const out = (t: number) => 1 - (1 - t) ** 3;
const CARD_WIDTH = 2.1;
const CARD_HEIGHT = 1.32;
const STEP = CARD_WIDTH + 0.03;
const SEGMENTS_X = 28;
const SEGMENTS_Y = 3;
const SAMPLES = 1200;

// The reference's fixed rail bends the actual image mesh. Rotating flat cards
// cannot reproduce the shallow near pass or the continuous receding strip.
export function createProjectRibbon(
  section: HTMLElement,
  projects: Project[],
  onOpen: (project: Project) => void,
) {
  const stage = section.querySelector<HTMLElement>(".work-stage")!;
  const canvas = section.querySelector<HTMLCanvasElement>("canvas")!;
  const gridElement = section.querySelector<HTMLElement>(".work-grid")!;
  const building = section.querySelector<HTMLElement>(".building")!;
  const experiences = section.querySelector<HTMLElement>(".experiences")!;
  const caption = section.querySelector<HTMLElement>(".work-intro-note")!;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160;
    const phase = mix(-1.5, Math.PI * 2 + 1.35, t);
    const cosine = Math.cos(phase);
    const u = 2 * t - 1;
    const depth = cosine > 0 ? 7.6 + 16.4 * cosine ** 0.9 : 7.6 + 2.2 * cosine;
    const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
    points.push(
      new THREE.Vector3(
        edge * Math.sin(phase) * depth * 0.561,
        0.5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * 0.63,
        -depth,
      ),
    );
  }
  const path = new THREE.CatmullRomCurve3(points, false, "centripetal");
  path.arcLengthDivisions = 1500;
  const pathLength = path.getLength();
  const pathPoints: THREE.Vector3[] = [];
  const pathTangents: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    pathPoints.push(path.getPointAt(i / SAMPLES));
    pathTangents.push(path.getTangentAt(i / SAMPLES));
  }
  const at = (
    distance: number,
    position: THREE.Vector3,
    tangent: THREE.Vector3,
  ) => {
    const sample = clamp(distance / pathLength) * SAMPLES;
    const i = Math.min(SAMPLES - 1, Math.floor(sample));
    position.lerpVectors(pathPoints[i], pathPoints[i + 1], sample - i);
    tangent
      .lerpVectors(pathTangents[i], pathTangents[i + 1], sample - i)
      .normalize();
  };

  let disposed = false;
  let frame = 0;
  let previousTime = 0;
  let progress = 0;
  let target = 0;
  const loader = new THREE.TextureLoader();
  // Two other real activations extend the strip without repeating its six covers.
  const sources = [
    ...projects.map((p) => p.image!),
    projectCovers.tictac,
    projectCovers.keebler,
  ];
  const ids = [...projects.map((p) => p.id), "tictac", "keebler"];
  const cards = sources.map((src, index) => {
    const geometry = new THREE.PlaneGeometry(1, 1, SEGMENTS_X, SEGMENTS_Y);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        map: { value: null },
        cover: { value: new THREE.Vector2(1, 1) },
        offset: { value: new THREE.Vector2(0, 0) },
        ready: { value: 0 },
        aspect: { value: CARD_WIDTH / CARD_HEIGHT },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec2 cover,offset;
        uniform float ready,aspect;
        varying vec2 vUv;
        void main(){
          float radius=.018;
          vec2 q=(abs(vUv-.5)-.5)*vec2(aspect,1.)+radius;
          float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
          float px=fwidth(d),alpha=1.-smoothstep(-px,px,d);
          if(alpha<.01)discard;
          vec2 uv=vUv;
          if(!gl_FrontFacing)uv.x=1.-uv.x;
          vec3 color=mix(vec3(.94),texture2D(map,(uv-.5)*cover+.5+offset).rgb,ready);
          gl_FragColor=vec4(color,alpha);
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    const texture = loader.load(src, (loaded) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      const aspect = loaded.image.width / loaded.image.height;
      const cardAspect = CARD_WIDTH / CARD_HEIGHT;
      material.uniforms.cover.value.set(
        aspect > cardAspect ? cardAspect / aspect : 1,
        aspect > cardAspect ? 1 : aspect / cardAspect,
      );
      const [x, y] = (projectCoverPositions[ids[index]] || "50% 50%")
        .split(" ")
        .map((value) => parseFloat(value) / 100);
      const cover = material.uniforms.cover.value;
      material.uniforms.offset.value.set(
        (x - 0.5) * (1 - cover.x),
        (0.5 - y) * (1 - cover.y),
      );
      material.uniforms.ready.value = 1;
      wake();
    });
    texture.colorSpace = THREE.NoColorSpace;
    material.uniforms.map.value = texture;
    return { index, geometry, material, mesh, texture };
  });

  let aspect = 1;
  let tangentHalfFov = 0.3153;
  let gridWidth = 1;
  let gap = 1;
  function grid(index: number) {
    const viewHeight = 16 * tangentHalfFov;
    const viewWidth = viewHeight * aspect;
    const width = (gridWidth - gap * 2) / 3;
    const height = width / (CARD_WIDTH / CARD_HEIGHT);
    const totalHeight = height * 2 + gap * 1.6;
    const column = index % 3;
    const row = Math.floor(index / 3);
    return {
      x: -gridWidth / 2 + width / 2 + column * (width + gap),
      y: totalHeight / 2 - height / 2 - row * (height + gap * 1.6),
      width,
      height,
      viewWidth,
      viewHeight,
      column,
      row,
    };
  }
  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    aspect = width / height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.fov =
      aspect < 16 / 9 ? (Math.atan(0.561 / aspect) * 360) / Math.PI : 35;
    camera.updateProjectionMatrix();
    tangentHalfFov = Math.tan((camera.fov * Math.PI) / 360);
    const viewHeight = 16 * tangentHalfFov;
    const viewWidth = viewHeight * aspect;
    gridWidth = Math.min(viewWidth * 0.74, viewHeight * 0.76 * 2.25);
    gap = gridWidth * 0.017;
    stage.style.setProperty(
      "--ribbon-grid-width",
      `${(gridWidth / viewWidth) * width}px`,
    );
    stage.style.setProperty(
      "--ribbon-column-gap",
      `${(gap / viewWidth) * width}px`,
    );
    stage.style.setProperty(
      "--ribbon-row-gap",
      `${((gap * 1.6) / viewHeight) * height}px`,
    );
    wake();
  }

  const position = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const up = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const vertex = new THREE.Vector3();
  function poseRibbon(card: (typeof cards)[number], head: number) {
    const positions = card.geometry.attributes.position;
    const center = head - card.index * STEP;
    for (let iy = 0; iy <= SEGMENTS_Y; iy++) {
      for (let ix = 0; ix <= SEGMENTS_X; ix++) {
        at(center + (ix / SEGMENTS_X - 0.5) * CARD_WIDTH, position, tangent);
        up.copy(worldUp)
          .addScaledVector(tangent, -worldUp.dot(tangent))
          .normalize();
        vertex
          .copy(position)
          .addScaledVector(up, (0.5 - iy / SEGMENTS_Y) * CARD_HEIGHT);
        positions.setXYZ(
          iy * (SEGMENTS_X + 1) + ix,
          vertex.x,
          vertex.y,
          vertex.z,
        );
      }
    }
    positions.needsUpdate = true;
    card.geometry.computeBoundingSphere();
  }
  function poseGrid(card: (typeof cards)[number], q: number) {
    const g = grid(card.index);
    const positions = card.geometry.attributes.position;
    const dx = (g.column - 1) * 1.2;
    const dy = g.row < 1 ? 1 : -1;
    const offsetX = dx * g.viewWidth * 0.62 * (1 - q);
    const offsetY =
      dy * g.viewHeight * (g.column === 1 ? 0.95 : 0.34) * (1 - q);
    const tilt = (1 - q) * 0.22 * (g.column - 1 || 0.5) * dy;
    for (let iy = 0; iy <= SEGMENTS_Y; iy++) {
      for (let ix = 0; ix <= SEGMENTS_X; ix++) {
        const x = (ix / SEGMENTS_X - 0.5) * g.width;
        const y = (0.5 - iy / SEGMENTS_Y) * g.height;
        positions.setXYZ(
          iy * (SEGMENTS_X + 1) + ix,
          g.x + offsetX + x * Math.cos(tilt) - y * Math.sin(tilt),
          g.y + offsetY + x * Math.sin(tilt) + y * Math.cos(tilt),
          -8 - (1 - q) * 0.6 * Math.sin((ix / SEGMENTS_X) * Math.PI),
        );
      }
    }
    positions.needsUpdate = true;
    card.geometry.computeBoundingSphere();
  }
  function render() {
    const rise = 1 - out(span(progress, 0, 0.12));
    const run = mix(-50, 76, span(progress, 0, 0.58));
    const vertical = rise * 12 - 15 * (1 - out(span(progress, 0.12, 0.24)));
    building.style.transform = `translate3d(${run}vw,${vertical}svh,0)`;
    experiences.style.transform = `translate3d(${-run}vw,${vertical}svh,0)`;
    building.style.opacity = experiences.style.opacity = String(
      1 - span(progress, 0.54, 0.6),
    );
    caption.style.opacity = String(1 - span(progress, 0.52, 0.57));
    caption.style.transform = `translate(-50%,calc(-50% + ${vertical}svh))`;
    const opacity = span(progress, 0.76, 0.82);
    gridElement.style.opacity = String(opacity);
    gridElement.inert = opacity === 0;
    gridElement.style.pointerEvents = opacity === 0 ? "none" : "auto";
    canvas.style.opacity = String(1 - opacity);
    section.dataset.progress = progress.toFixed(3);
    const head = mix(
      0,
      pathLength + cards.length * STEP,
      span(progress, 0.08, 0.63),
    );
    for (const card of cards) {
      const distance = head - card.index * STEP;
      const end = pathLength - CARD_WIDTH;
      if (distance < end) {
        card.mesh.visible = distance > CARD_WIDTH;
        if (card.mesh.visible) poseRibbon(card, head);
      } else if (card.index < projects.length) {
        const start = mix(
          0.08,
          0.63,
          (end + card.index * STEP) / (pathLength + cards.length * STEP),
        );
        const q = out(span(progress, start, start + 0.13));
        card.mesh.visible = q > 0.001;
        if (card.mesh.visible) poseGrid(card, q);
      } else card.mesh.visible = false;
    }
    renderer.render(scene, camera);
  }
  function tick(time: number) {
    frame = 0;
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16.67;
    previousTime = time;
    progress += (target - progress) * (1 - Math.pow(0.91, elapsed / 16.67));
    if (Math.abs(target - progress) < 0.00005) progress = target;
    render();
    if (progress !== target) wake();
    else previousTime = 0;
  }
  function wake() {
    if (!disposed && !frame) frame = requestAnimationFrame(tick);
  }
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function projectAt(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(
      cards.filter((card) => card.mesh.visible).map((card) => card.mesh),
      false,
    )[0];
    const card = hit && cards.find((card) => card.mesh === hit.object);
    return card
      ? allProjects.find((project) => project.id === ids[card.index])
      : undefined;
  }
  function hover(event: PointerEvent) {
    canvas.style.cursor = projectAt(event) ? "pointer" : "auto";
  }
  let pressed: { x: number; y: number; project: Project } | undefined;
  function open(event: PointerEvent) {
    if (event.button !== 0) return;
    const project = projectAt(event);
    if (!project) return;
    if (event.pointerType === "mouse") onOpen(project);
    else pressed = { x: event.clientX, y: event.clientY, project };
  }
  function release(event: PointerEvent) {
    if (
      pressed &&
      Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) < 8
    )
      onOpen(pressed.project);
    pressed = undefined;
  }
  function cancel() {
    pressed = undefined;
  }
  canvas.addEventListener("pointermove", hover);
  canvas.addEventListener("pointerdown", open);
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", cancel);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
  return {
    setProgress(value: number, instant = false) {
      target = clamp(value);
      if (instant) {
        progress = target;
        render();
      }
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", hover);
      canvas.removeEventListener("pointerdown", open);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", cancel);
      cards.forEach(({ texture, geometry, material }) => {
        texture.dispose();
        geometry.dispose();
        material.dispose();
      });
      renderer.dispose();
      gridElement.inert = false;
      [gridElement, canvas, building, experiences, caption].forEach((el) =>
        el.removeAttribute("style"),
      );
    },
  };
}
