"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import TextType from "./TextType";
import "./typed-heading.css";

export function TypedHeading({ children }: { children: ReactNode }) {
  const root = useRef<HTMLSpanElement>(null);
  const [animate, setAnimate] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(root.current!);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  let delay = 0;
  function type(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (node) => {
      if (typeof node === "string") {
        const initialDelay = delay;
        delay += Array.from(node).length * 25;
        return (
          <TextType
            as="span"
            text={node}
            typingSpeed={25}
            initialDelay={initialDelay}
            loop={false}
            showCursor={false}
            typeEffect="blur"
          />
        );
      }
      if (isValidElement<{ children?: ReactNode }>(node) && node.props.children)
        return cloneElement(
          node as ReactElement<{ children?: ReactNode }>,
          {},
          type(node.props.children),
        );
      return node;
    });
  }
  return (
    <span ref={root} className="typed-heading">
      <span className={animate ? "typed-heading-layout" : undefined}>
        {children}
      </span>
      {animate && (
        <span className="typed-heading-animation" aria-hidden="true">
          {started && type(children)}
        </span>
      )}
    </span>
  );
}
