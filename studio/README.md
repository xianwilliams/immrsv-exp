# IMMRSV website editor

A standalone Sanity Studio for this website. The editor has its own address and uses Sanity authentication. There is no editor link on the public site. Only project members can edit; not publishing the URL is not the access control.

## Free-plan configuration

This editor uses core Studio forms, native dataset image uploads, image crop/hotspot controls, draft/publish, references, and ordered arrays. These are sufficient for the requested editing workflow on Sanity's Free plan. No paid plugin, custom permission role, private dataset, AI Assist, or separate Media Library product is required. Tasks, comments, releases, scheduled drafts, scheduled publishing, and Media Library are explicitly disabled in `sanity.config.ts`.

The dedicated project is `mp1drxt3`, in the IMMRSV organization `ol2woczne`, using the public `production` dataset. Sanity automatically started it on a Growth trial. The Plan screen confirms it will return to Free after the trial, and no payment method was added. The website and editor do not depend on trial features. Check the Plan screen again at handoff; do not upgrade or add paid services. Free resource quotas still apply and can be monitored in Manage. See [Sanity pricing](https://www.sanity.io/pricing) and [plans and payments](https://www.sanity.io/docs/platform-management/plans-and-payments).

## Local development

Use Node 22.12 or later. Run `npm ci` in this directory, copy `.env.example` to `.env.local`, and set the project ID and dataset. Then run `npm run dev` and open http://127.0.0.1:3333. No write token belongs in Studio environment variables.

Run `npm run typecheck` and `npm run build` to verify the editor. `npm run deploy` deploys only the editor to Sanity hosting; it does not deploy the website. Deploy only after the configured project and intended hostname have been checked.

The **Start here** panel in the editor explains routine tasks. Publishing a project creates its full case-study page. Add a reference under **Home → Case studies** to show its card and popup on the homepage. Hero slideshow and client-logo selections have their own ordered lists. Remove a homepage reference to keep a project page but stop featuring it; disable and publish the project to hide it everywhere.

Home and Site settings are singletons. Their duplicate, delete, and unpublish actions are removed to prevent accidentally emptying the site. Projects and client logos can be created, edited, hidden, and reordered through the homepage reference lists. The forms keep the existing website templates intact.

The **Published preview** tab opens the connected website. It is deliberately labeled: it does not expose draft data. The frontend reads the published perspective only. Set `SANITY_STUDIO_PREVIEW_URL` to the local website while testing and the final domain when launched.

Before handoff, invite Nick to the Sanity project, confirm he can edit and publish using his own login, and transfer the project/organization as agreed. Do not share account passwords. Keep the Studio's public project ID/dataset configuration separate from any server-side or migration credentials.

See [the handoff guide](../docs/sanity-handoff.md) for the configuration, ownership transfer, and acceptance checks. A successful local build is not a website or Studio deployment.
