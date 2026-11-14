/** Case-study copy grounded in the owner's supplied role credits, project posts, and archive.
 * Starry and Crumbl entries document visible project features; they do not assert unverified service responsibilities.
 * Source basis: docs/project-story-sources.json.
 */
export type ProjectStory = {
  eyebrow: string;
  summary: string;
  scope: Array<{ title: string; description: string }>;
};

export const projectStories: Record<string, ProjectStory> = {
  wcdonalds: {
    eyebrow: "Immersive dining · Hollywood, California · 2024",
    summary:
      "WcDonald’s turned an anime-inspired restaurant into a real place to eat, play, and explore. The March 2024 activation surrounded guests with projections across its walls and tables, carrying them through a four-part dining experience. Nick supported the physical delivery alongside the wider creative and production team, with a remit spanning fabrication oversight, installation, dismantle, and staffing.",
    scope: [
      {
        title: "Fabrication oversight",
        description:
          "Nick provided fabrication oversight for the physical restaurant build. Its branded environment had to sit alongside the projection-mapped walls and tabletops that brought the WcDonald’s world to life.",
      },
      {
        title: "Install + dismantle management",
        description:
          "The scope included managing installation and dismantle for the temporary Hollywood experience. This covered the physical delivery of the event environment through its setup and eventual removal.",
      },
      {
        title: "Staffing",
        description:
          "Staffing formed part of Nick’s production contribution to the live experience. The public-facing program included seated dining, walk-through access, and an interactive vending machine for fans without a reservation.",
      },
    ],
  },
  starry: {
    eyebrow: "Brand activation · Selected archive work",
    summary:
      "A basketball court became the center of a live Starry brand experience. The installation brought together a branded playing surface, large graphics, a shooting area, and space for spectators to follow the action. This selection from IMMRSV’s project archive shows both the environment itself and the way fans used it.",
    scope: [
      {
        title: "A fully branded court",
        description:
          "Starry’s identity extended from the basketball and playing surface to the walls surrounding the court. The complete environment gave the activation a clear presence within a larger indoor event.",
      },
      {
        title: "Participation at the center",
        description:
          "The archive shows guests taking shots and participating on the court. Basketball provided a direct way to engage with the brand through an activity people already understood.",
      },
      {
        title: "Built around a live audience",
        description:
          "Spectators gathered in the stands and along the court’s edges. The photographs capture the relationship between the playing area, the crowd, and the wider event floor.",
      },
    ],
  },
  crumbl: {
    eyebrow: "Brand environment · Crumbl headquarters · Selected archive work",
    summary:
      "Crumbl’s headquarters brought the brand’s familiar world into physical space, from oversized baking ingredients to places where people could sit, gather, and take a photograph. The supplied 2023 project archive documents a connected environment of sculptural features, dimensional displays, and custom details throughout the building.",
    scope: [
      {
        title: "Larger-than-life brand features",
        description:
          "A giant pink mixer, oversized cookies, and a display of butter, eggs, and a spatula turned familiar baking objects into architectural-scale features. The archive shows these pieces as finished parts of the headquarters environment.",
      },
      {
        title: "Places to interact",
        description:
          "A large cookie box became a place to sit, while branded swings surrounded a communal table. These features gave visitors and the team ways to experience the space beyond looking at it.",
      },
      {
        title: "Details throughout the building",
        description:
          "Dimensional cookie displays, pink mailboxes, entrance lettering, and corridor graphics carried the identity into different areas of the headquarters. Together, they made the brand part of the everyday surroundings.",
      },
    ],
  },
  sundance: {
    eyebrow: "Festival production · Park City, Utah · 2024–2026",
    summary:
      "Across three Sundance seasons, Nick contributed fabrication management, event production, and specialty staffing. In 2026, The Guru House partnered with Number Project on the World of Hyatt experience and also created The Hollywood Reporter’s private media space. The work brought together interview environments, wellness sessions, conversations, sensory experiences, and evening entertainment within a busy festival setting.",
    scope: [
      {
        title: "Fabrication management",
        description:
          "Fabrication management supported the physical environments behind the festival program. The 2026 work included the World of Hyatt space and The Hollywood Reporter’s interview settings and branded vignettes.",
      },
      {
        title: "Event production",
        description:
          "Nick’s event production role supported a program that moved between wellness mornings, panel conversations, workshops, and evening performances. World of Hyatt’s schedule also included fragrance sessions, aura photography, mixology, and nightly bingo.",
      },
      {
        title: "Specialty staffing",
        description:
          "Specialty staffing was part of Nick’s contribution to the festival production team. It supported an experience with several formats, from private media activity to classes, conversations, and entertainment.",
      },
    ],
  },
  "nascar-billboard": {
    eyebrow: "Live brand activation · Times Square, New York",
    summary:
      "NASCAR’s season-opening idea became a custom billboard with a full-size Next Gen engine replica embedded in its surface. Connected to an accelerator, the installation brought the sound of racing into Times Square and earned a Guinness World Records title. Nick’s role covered fabrication management, specialty staffing, and logistics within the production effort delivered with The Guru House and 72andSunny.",
    scope: [
      {
        title: "Fabrication management",
        description:
          "Nick provided fabrication management for the custom billboard installation. The physical build integrated an engine replica and a fractured surface treatment that made the engine appear to break through the board.",
      },
      {
        title: "Specialty staffing",
        description:
          "Specialty staffing supported delivery of the live activation in Times Square. The project brought together a custom structure, technical interaction, and an event taking place in a highly visible public setting.",
      },
      {
        title: "Logistics",
        description:
          "Logistics formed part of Nick’s role in bringing the installation from fabrication to its event location. The scale of the build and its Times Square setting made the movement and placement of the physical experience central to delivery.",
      },
    ],
  },
  stones: {
    eyebrow: "Music + motorsport · Chicago, Illinois · 2026",
    summary:
      "Ahead of The Rolling Stones’ Foreign Tongues album release, a retired NASCAR race car became the Racing Record Player: a mobile listening lounge filled with references to the band’s history. The activation welcomed fans across three days in Chicago. Nick contributed fabrication management, event production, logistics, and staffing as part of the broader collaboration with NASCAR and its production partners.",
    scope: [
      {
        title: "Fabrication management",
        description:
          "Fabrication management supported the conversion of a retired race car into an interactive listening environment. The finished car combined a custom interior, music memorabilia, and vehicle controls connected to the audio and visual experience.",
      },
      {
        title: "Event production",
        description:
          "Nick’s event production contribution supported the three-day Chicago activation. The experience brought the listening car together with a branded display and merchandise environment for visiting music and racing fans.",
      },
      {
        title: "Logistics",
        description:
          "Logistics supported an activation designed to travel with the car and its surrounding display. The physical experience appeared at public locations and a race venue, bringing its distinctive footprint into different settings.",
      },
      {
        title: "Staffing",
        description:
          "Staffing was part of Nick’s support for the live listening experience. Visitors entered the car and explored an interaction in which the gearshift selected songs and the pedals controlled the volume.",
      },
    ],
  },
  tictac: {
    eyebrow: "Mobile sampling tour · Colleges + game days across the South",
    summary:
      "The Vibe Refresh Squad took the Tic Tac and Dr Pepper flavor collaboration on the road. Branded mobile carts visited colleges, universities, and game days across the South, meeting fans around student unions, campus walkways, late-night food stops, and tailgates. Nick’s role combined remote tour production, staffing, routing, and site negotiation.",
    scope: [
      {
        title: "Remote tour production",
        description:
          "Nick provided remote production support for the traveling sampling program. The role connected the production effort across a tour that reached multiple campuses and event locations.",
      },
      {
        title: "Staffing",
        description:
          "Staffing supported the mobile activation and its interactions with visitors. The experience centered on product sampling and a welcoming encounter with the Vibe Refresh Squad at each stop.",
      },
      {
        title: "Routing",
        description:
          "Routing was part of the tour’s delivery across colleges, universities, and game days in the South. It linked the different destinations of a mobile experience built to reach people in their daily surroundings.",
      },
      {
        title: "Site negotiation",
        description:
          "Site negotiation supported access to university properties and other host venues. The resulting locations put the activation close to campus activity, food stops, and game-day crowds.",
      },
    ],
  },
  fourloko: {
    eyebrow: "Traveling brand activation · Live Nation festival circuit",
    summary:
      "The Four Loko Party Store combined a neighborhood bodega and a bus stop in a footprint of just 140 square feet. Created with The Guru House and Number Project, it traveled the Live Nation festival circuit with a candy counter, graffiti area, working payphone, and limited-edition merchandise. Nick’s responsibilities covered fabrication management, event production, and logistics.",
    scope: [
      {
        title: "Fabrication management",
        description:
          "Nick provided fabrication management for the compact custom environment. The build packed interactive details—including a working payphone and a security-style television with a custom filter—into the small store footprint.",
      },
      {
        title: "Event production",
        description:
          "Event production supported the Party Store as a live experience at festival stops. Fans could explore its graphics, counter, merchandise, and playful interactions as part of their time at the event.",
      },
      {
        title: "Logistics",
        description:
          "Logistics supported taking the reusable installation through the festival circuit. A compact footprint allowed the experience to move between stops while retaining the recognizable world of the Party Store.",
      },
    ],
  },
  keebler: {
    eyebrow: "One-day pop-up · Grand Central Terminal, New York",
    summary:
      "Keebler’s Hollow Tree Express arrived at Grand Central Terminal for a one-day Butterbeer cookie sampling experience. A pull of the cookie-tap handle filled a branded mug with Butterbeer-flavored Fudge Stripes, while tree textures, foliage, sound, and costumed hosts built out the world around it. Nick’s contribution covered fabrication management, event production, and site negotiation.",
    scope: [
      {
        title: "Fabrication management",
        description:
          "Fabrication management supported the custom Hollow Tree Express environment and its physical details. The finished installation combined tree-inspired surfaces, foliage, branded signs, and cookie taps in a cohesive pop-up setting.",
      },
      {
        title: "Event production",
        description:
          "Nick’s event production role supported the one-day sampling event and its guest experience. Cookie taps, themed sound, branded mugs, and the hosts’ baker and conductor costumes made the interaction feel like part of Keebler’s world.",
      },
      {
        title: "Site negotiation",
        description:
          "Site negotiation formed part of the work behind bringing the pop-up to Grand Central Terminal. The location placed the experience directly in the path of commuters and visiting fans.",
      },
    ],
  },
};
