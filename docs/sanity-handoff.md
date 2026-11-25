# IMMRSV content editor handoff

The Sanity editor lets Nick maintain content within the existing website design. It is a separate, login-protected editor with no public website navigation link. Website visitors cannot edit content. The dataset is public because it contains website content; do not store passwords, form submissions, confidential client documents, or API secrets in it.

## Project configuration

| Setting        | Value                                         |
| -------------- | --------------------------------------------- |
| Sanity project | `mp1drxt3`                                    |
| Organization   | IMMRSV — `ol2woczne`                          |
| Dataset        | `production` (public)                         |
| Local website  | `http://127.0.0.1:3100` (current test server) |
| Local editor   | `http://127.0.0.1:3333`                       |
| Hosted editor  | `https://immrsv-editor.sanity.studio/`        |

The website and editor are separate builds. The authenticated editor is hosted on Sanity. Both existing Vercel projects (`immrsv-exp` and `xianwilliams-immrsv-exp`) have production configuration for `SANITY_PROJECT_ID=mp1drxt3` and `SANITY_DATASET=production`. Publishing content changes the connected website after its cache refresh; deploying the editor does not deploy the website. The **Published preview** tab uses `https://immrsv-exp.vercel.app` and shows published content, not unpublished drafts. Update that setting to Nick’s domain at launch.

## Free only

The requested workflow uses Free-plan features: content documents, native image assets, references, ordered sections/galleries, and manual publishing. It does not use custom roles, private datasets, AI Assist, the separate Media Library product, paid plugins, or scheduled publishing. Tasks, comments, releases, scheduled drafts, scheduled publishing, and Media Library are disabled in the Studio configuration. Drafts and the normal Publish button remain available.

Sanity automatically applied a Growth trial when the project was created. The Plan screen confirms automatic downgrade to Free when the trial ends; no payment method was added. There is no dependency on trial features. Verify the project is on Free, or still scheduled to return to Free, during handoff. Do not accept an upgrade or add a paid service. Free usage quotas are hard limits, so monitor storage, bandwidth, and API use in Manage. [Official plan and quota details](https://www.sanity.io/docs/platform-management/plans-and-payments).

## What Nick can edit

- **Home:** copy, three About photos, service summaries, selected hero projects, client logos, and featured case studies. Drag homepage sections into order or hide a section. Hero and footer keep their fixed positions.
- **Projects:** create a reusable case-study page; change its title, page address, overview, responsibilities, credits, thumbnail, popup accordion images, full gallery, and search description. Reorder photos and adjust crop/hotspot. A popup gallery can inherit the first six full-gallery images.
- **Client logos:** add or replace logos, select a related project, and set the hover preview. Add, remove, or reorder their references under Home → Client lineup.
- **Site settings:** navigation labels, social links, email link, footer text, project-page banner, and default search descriptions.

Publish a project, then reference it under **Home → Case studies** to feature it on the homepage. Removing that reference preserves its direct project page. Disable and publish a project to hide it everywhere. Publish Home after changing its selections or order.

The contact form recipient is managed separately through Web3Forms. Changing the public contact email in Sanity changes email links, not the recipient of submitted forms. New layout types, new features, and integration changes still require development work.

## Transfer and acceptance

1. Nick creates his own free Sanity account. Invite him to this project using an available Free-plan role; grant administrative access for ownership handoff. No shared passwords or custom paid roles are needed.
2. Confirm his login can upload an image, edit copy, create/publish a test project, feature it, reorder a section, and update a client logo. Verify those changes on the connected website, including its popup and direct project page. Remove the test content afterward.
3. Make Nick an administrator of the dedicated IMMRSV organization, or transfer the project to his organization through Manage. Confirm access in the receiving organization before removing Fruitstand's administrative access. [Sanity organization and handoff guidance](https://www.sanity.io/docs/platform-management/projects-organizations-and-billing).
4. Keep the same project and dataset when transferring ownership. A transfer does not require rebuilding the content model. Confirm website configuration and both published URLs afterward, and update `SANITY_STUDIO_PREVIEW_URL` to the final website domain before redeploying the editor.
5. Verify the Free plan, usage, account ownership, form recipient, and routine publishing once more. Retain Fruitstand access only if agreed for ongoing support.

This guide describes the setup and remaining handoff checks; it does not itself confirm production deployment or transfer to Nick.

## Verification and maintenance

The local production build passed publishing checks for draft isolation, a new project route without rebuilding, changed project copy, a new client logo, section reordering, homepage featuring, and disabling a project. Temporary acceptance-test records were removed and the original content restored. `studio/scripts/verify-publishing.ts` explicitly requires the intended project ID and a localhost target; do not run it against a website already in use without agreeing on a test window.

The separate user-requested demonstration is `project-cms-test`, at `/work/cms-test`. It uses existing approved Starry photos and is labeled as a temporary website test. It is intentionally left available for review. To remove it after review, remove it from Home → Case studies, publish Home, then disable the test project and publish. The original Starry project is unaffected.

The public website dependency audit is clean. The editor audit has no high/critical findings; 14 moderate transitive advisories remain in Sanity’s CLI dependency chain (`@oclif/core` → `minimatch`). These concern the developer CLI, not a public website dependency. Follow upstream compatible updates rather than force-downgrading the editor.
