# IMMRSV — Nick’s revision checklist

Local revision, November 20, 2026. Baseline: `16d57f0` (the build before the first revision pass). The broader experimental pass is archived in ignored `ASSETS/revision-history/overbroad-local-pass/`.

The purpose is a professional introduction and a view of the work. Keep essentials, avoid repeated positioning and unsupported claims, and leave Nick’s further copy edits for his next review.

| Nick’s note      | Local implementation                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Home screen   | Block logo at top left; desktop navigation in one row at right; rounded, bordered approved-photo slideshow fully visible in the first screen. Compact landscape composition on mobile preserves the installations. The “since 2016” statement is removed.                                                     |
| 2. About         | The opening support copy and former bottom About section are combined immediately after the reel. Two short paragraphs cover independent production, flexible project scope, Nick, and working alongside agencies and brand teams. About navigation targets this section. “Tell Us What You Need” is removed. |
| 3. Client lineup | The existing logo wall, hover previews, and links to project pages are retained. Heading is “Who We’ve Worked With.” Logos correspond to the approved portfolio.                                                                                                                                              |
| 4. Services      | Directly after About and before the client lineup. Repeated introductory copy, photographs, autoplay, and contact CTA are removed. Six short expandable descriptions retain the IBM Plex Mono labels and service icons.                                                                                       |
| 5. Case studies  | Original highlight-photo cards retained, enlarged from three columns to two on desktop and one on mobile. No ribbon, pinning, or scroll-to-unlock behavior in this section. It sits directly below the logo wall. A shared page frame maintains the side-border reveal through the full scroll.               |
| 6. Testimonials  | Entire section removed.                                                                                                                                                                                                                                                                                       |
| 7. Contact       | The original form’s fields and split visual treatment are embedded directly below the project cards. Homepage contact links scroll here; case-study contact buttons return here. The popup contact form is removed. The redundant closing CTA is replaced by the embedded form.                               |
| 8. Footer        | InEvent badge removed. Existing larger logo, paragraph, social links, location, Fruitstand credit, and subtle pixel effect retained.                                                                                                                                                                          |

## Approved portfolio

Ten entries, with 64 gallery images: Foam Sculptures; Brandless Consumer Summit; Pandora Las Vegas Launch; Maison Margiela; Comfort Cases × Lisa Barlow; Crumbl Manager’s Conference; Crumbl Edmonton Launch; Crumbl HQ Build Out & Branding; Dreamy Draw installation; Starry NBA All-Star Branding & Operations.

Guru House employment projects are excluded from project data, routes, logo previews, hero, banners, contact imagery, and galleries. Their unused public assets are archived locally under `ASSETS/retired-web-media/`. Original source files remain available privately.

## Retained from the baseline

Geist display typography, IBM Plex Mono labels, black/white/red palette, light/dark toggle, brief logo intro, subtle heading reveals, approved team-photo collage, client hover previews, project popup accordions, full galleries and image viewer, case-study layout and photo banner, and the full footer. These were not redesigned.

## Content and delivery notes

- **Dreamy Draw needs confirmation:** Nick’s linked folder contains mirrored-column installation photos, while his email title says “Cactus Installation.” The local draft shows that linked imagery as “Dreamy Draw — Outdoor Installation.” It does not invent cactus imagery or additional responsibilities.
- **Project responsibilities:** Only explicit roles supplied in the approved project names are listed. Where detailed credits are unavailable, show concise factual descriptions and photos. Keep CNC attribution on Pandora and Maison Margiela.
- **Form delivery verified:** Web3Forms replaces the unfinished Resend connection. A live submission through the local website reached `xian.williams@gmail.com` on November 23, 2026. All submitted content and the Reply-To header were verified in the received email. Replace the public form key with Nick’s key, rebuild, and test the final domain at handoff. The email-draft fallback is removed. Production builds require the form key; submission and confirmation stay on the page. See the setup and handoff steps in [README](../README.md).
- **Publishing:** Prepared locally for review; the source push to `main` was requested on November 24, 2026. The ignored local form key is not included in Git. Set the Web3Forms environment variable in the hosting project before its build; switch to Nick’s key and test the final domain at handoff.

Source mappings: [approved media](approved-media-sources.json), [client logos](client-logo-sources.json). Browser verification: `scripts/verify.mjs`; output under ignored `qa/`.

## Verification

Production build, TypeScript, formatting, and seven inquiry tests pass. The latest form checks at 1440 and 390 pixels cover successful submission, rejected submission, retained input, and duplicate-click prevention using mocked responses. Earlier full-site browser checks passed at 1440, 768, 390, and 320 pixels: slideshow fit, section order, service controls, project dialog and image viewer, focus restoration, dark mode, embedded form layout, logo-preview stacking, all ten galleries / 64 photos, retired-route removal, and case-study contact navigation. No browser runtime errors were recorded. Hosted deployment and final-domain delivery require separate verification.
