# IMMRSV website editor

A Sanity Studio available at the website's `/studio` address and at `https://immrsv-editor.sanity.studio/`. Both entrances use the same configuration, project, dataset, and Sanity authentication. There is no editor link on the public site. Only project members can edit; not publishing the URL is not the access control.

## Free-plan configuration

This editor uses core Studio forms, native dataset image uploads, image crop/hotspot controls, draft/publish, references, and ordered arrays. These are sufficient for the requested editing workflow on Sanity's Free plan. No paid plugin, custom permission role, private dataset, AI Assist, or separate Media Library product is required. Tasks, comments, releases, scheduled drafts, scheduled publishing, and Media Library are explicitly disabled in the shared `config.ts`.

The dedicated project is `mp1drxt3`, in the IMMRSV organization `ol2woczne`, using the public `production` dataset. Sanity automatically started it on a Growth trial. The Plan screen confirms it will return to Free after the trial, and no payment method was added. The website and editor do not depend on trial features. Check the Plan screen again at handoff; do not upgrade or add paid services. Free resource quotas still apply and can be monitored in Manage. See [Sanity pricing](https://www.sanity.io/pricing) and [plans and payments](https://www.sanity.io/docs/platform-management/plans-and-payments).

## Local development

Use Node 22.12 or later. Run `npm ci` at the repository root; the website and editor share its lockfile. With `SANITY_PROJECT_ID` and `SANITY_DATASET` configured in the root `.env.local`, run `npm run dev` from the root and open http://127.0.0.1:3000/studio. The editor has its own root layout, isolated from the public website's styles and navigation. No write token belongs in Studio environment variables.

To run the standalone editor, copy `studio/.env.example` to `studio/.env.local` and set its public configuration, then run `npm run dev --workspace studio` from the root. It opens at http://127.0.0.1:3333.

Run `npm run typecheck`, `npm run typecheck --workspace studio`, and `npm run build` from the root to verify the embedded editor and website. `npm run build --workspace studio` checks the standalone editor; `npm run deploy --workspace studio` deploys only that alternate entrance to Sanity hosting. A website deployment includes `/studio`. Deploy only after the configured project and intended hostname have been checked.

Sanity's API settings must allow the exact website origin with credentials for login. Local port 3000 and the two existing Vercel domains are configured. Add the final domain before using its `/studio` address. Changing a hostname needs no content migration; changing `/studio` also requires updating the Next.js route and the shared configuration's `basePath` for that entrance.

The **Start here** panel in the editor explains routine tasks. Publishing a project creates its full case-study page. Add a reference under **Home → Case studies** to show its card and popup on the homepage. Hero slideshow and client-logo selections have their own ordered lists. Remove a homepage reference to keep a project page but stop featuring it; disable and publish the project to hide it everywhere.

Home and Site settings are singletons. Their duplicate, delete, and unpublish actions are removed to prevent accidentally emptying the site. Projects and client logos can be created, edited, hidden, and reordered through the homepage reference lists. The forms keep the existing website templates intact.

For a new logo, publish its **Client logos** record, then select it under **Home → Client lineup → Logos to display** and publish Home. Publishing the logo alone does not place it on the homepage. Drag these selections into order; removing one preserves its logo record. The lineup supports up to 60 logos, wrapping into centered rows of three on desktop or two on mobile, with incomplete rows centered as well.

The **Published preview** tab opens the connected website. It is deliberately labeled: it does not expose draft data. The frontend reads the published perspective only. The embedded editor uses its own website origin, so its links follow a domain change automatically. For the standalone editor, set `SANITY_STUDIO_PREVIEW_URL` to the local website while testing and the final domain when launched.

Before handoff, invite Nick to the Sanity project, confirm he can edit and publish using his own login, and transfer the project/organization as agreed. Do not share account passwords. Keep the Studio's public project ID/dataset configuration separate from any server-side or migration credentials.

See [the handoff guide](../docs/sanity-handoff.md) for the configuration, ownership transfer, and acceptance checks. A successful local build is not a website or Studio deployment.
