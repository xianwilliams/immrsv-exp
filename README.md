# IMMRSV

Next.js portfolio for IMMRSV’s independent experiential production work. This local revision follows Nick’s numbered feedback while retaining the previous build’s visual identity. The complete checklist and remaining content clarification are in [docs/BUILD-BRIEF.md](docs/BUILD-BRIEF.md).

The homepage contains a framed photo slideshow, combined About section, concise text-only services, the client logo wall, enlarged static project cards, and an embedded contact form. Ten approved project galleries retain the original popup accordions, full-image viewer, case-study layout, and dark photo banners. Dark mode keeps already-dark sections dark.

Run `npm ci`, then `npm run dev` and open http://127.0.0.1:3000. For a production preview, run `npm run build` followed by `npm run start -- --port 3100`.

Content editing is available at `/studio` on the website, using Sanity's standard login and project membership permissions. There is no editor link in the public navigation. The [hosted editor](https://immrsv-editor.sanity.studio/) remains another entrance to the same project and content. Set `SANITY_PROJECT_ID` and `SANITY_DATASET` in the website environment to connect it; publishing then updates content on a subsequent visit after the approximately 30-second cache refresh. New project pages do not require a rebuild. Without either variable, the original local content remains available for development. The shared Studio configuration lives under the `studio/` npm workspace; run `npm ci` at the repository root to install both. See its [setup guide](studio/README.md) and the [Free-plan ownership handoff](docs/sanity-handoff.md).

Run `npm run typecheck`, `npm test`, and `npm run build` for code checks. With the preview running, `npm run verify` checks four viewport sizes, section order, hero fit, service keyboard interaction, image viewers, dark-mode persistence, logo preview layering, approved project routes, and retired routes. Use `BASE_URL` to target another port and `CHROME_PATH` for a nonstandard Chrome installation. Screenshots and reports are saved under ignored `qa/`. Verification does not send emails.

The contact form uses [Web3Forms](https://web3forms.com/) to email the name, email address, subject, and request to the inbox associated with its form key. The visitor stays on the page, and the sender’s email becomes the reply-to address. No Resend account, custom mail server, or sender-domain verification is required. Web3Forms’ free plan currently allows 250 submissions per month; submissions stop if that allowance is exhausted. Nick can work entirely from his inbox.

To test delivery:

1. Create a free form at [Web3Forms](https://app.web3forms.com) and verify the test recipient, initially `xian.williams@gmail.com`.
2. Put `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-form-access-key` in ignored `.env.local`. This is Web3Forms’ deliberately public submission key, not an account secret. Do not put any private account credentials in a `NEXT_PUBLIC_` variable.
3. Restart the local preview. Submit a clearly labeled test through the embedded form. Confirm the message arrives with all four fields and that Reply addresses the test sender. A success message alone is not proof of inbox delivery; check spam/updates if needed.

For handoff, Nick creates and verifies his own free form for `nick@immrsv-exp.com`. Replace the same environment variable in the hosting project with his form key, then rebuild/redeploy: Next.js embeds `NEXT_PUBLIC_` values at build time. No recipient is hardcoded into the submission and no copy is sent to the developer. Send one launch test and have Nick confirm receipt and Reply behavior before retiring the old form.

The integration posts directly from the browser, as [Web3Forms requires on its free plan](https://docs.web3forms.com/getting-started/troubleshooting). It uses the provider’s spam checks plus a local honeypot, prevents repeated clicks while sending, and retains entered text on failure. Production builds stop if the form key is missing, so a deployment cannot silently replace submission with an email draft. Submission always stays on the website; failures retain the entered message and allow a retry. Automated tests mock Web3Forms and never send mail. Run `node scripts/verify-contact.mjs` against a configured preview for desktop/mobile success, failure, message preservation, and duplicate-click checks.

Live delivery was verified on November 23, 2026: one test submitted through the local website arrived in `xian.williams@gmail.com`, with the name and multiline message intact, the requested subject in the email title, and Reply-To matching the sender. The form showed its success confirmation. Nick’s recipient switch and a test on the final domain remain launch tasks. Keep preview indexing disabled until launch.

Active images are under `public/media/approved/`; their source mapping is [docs/approved-media-sources.json](docs/approved-media-sources.json). Client logo sources are in [docs/client-logo-sources.json](docs/client-logo-sources.json). Original media, retired public assets, and the earlier revision pass remain in ignored `ASSETS/`. Local deck exports are in ignored `deliverables/`.
