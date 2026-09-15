# MBF live-site reconciliation and viewer update

Prepared September 14, 2026 (Pacific). Nothing has been deployed.

## Baseline and preservation

Production Worker version: `5ae02dba-6422-4ca1-9cc1-17cf325c14c6`.

The deployed application differed substantially from GitHub main. Its compiled public-file inventory names 82 files. All 82 were downloaded successfully, including the September 15 briefing and interactive agenda, earlier agendas, their source data, and shared Council scripts/styles. These static source files are now restored under `public/`. Differing pre-existing local files were backed up in `outputs/viewer-update-baseline/local-before/`.

The original deployment's Worker modules, public files, and browser chunks are preserved under `outputs/viewer-update-baseline/`. Downloaded HTML has the edge-injected Cloudflare analytics script removed when restored or packaged, avoiding embedding an injected script in source. No editorial content was rewritten.

The local React homepage and main Worker source also differ from production. They have not been reverse-engineered or replaced. **Do not deploy a normal full rebuild for this fix.** The targeted package retains the actual production Worker modules, homepage rendering, compatibility date, asset caching and retired-route behavior. Local PD files remain in the checkout; the package preserves production's existing HTTP 410 behavior for those retired routes.

## Viewer-only release

Run `python scripts/prepare_viewer_only_release.py` with Python 3. The captured baseline must be present. Output: `outputs/viewer-only-release/`. This script prepares files only; it never deploys.

The release contains 89 site assets plus the preserved cache header file. Compared with the captured site, the functional changes are limited to:

- `documents/viewer.html`: load the shared reader and refreshed viewer script.
- `documents/viewer.js`: use the shared mobile reader while preserving embedded mode, document titles, return navigation, reopen and download actions.
- `documents/pdf-reader.js`: shared single-page PDF renderer, navigation, expansion control and new-tab link.
- `worker/document-proxy.mjs`: narrowly scoped, streaming PDF loading from the existing official archive and eScribe document endpoint. All other requests are delegated to the unchanged production Worker.

The proxy is necessary because the live site returns 404 for `/council-documents/...`, while the archive response does not provide cross-origin access for the browser reader. It accepts only GET/HEAD, forwards range/conditional headers, rejects unsupported source hosts, and does not follow redirects to other hosts.

The prepared entry point wraps the preserved Worker with this proxy. Its `wrangler.json` is the configuration for this targeted release. `manifest.json` records file hashes and the baseline version. Generated baseline/release directories are intentionally Git-ignored; retain them locally for this deployment and rollback review.

## Validation

- Wrangler deploy **dry run** passed; no upload or deployment occurred.
- All 82 public-file inventory paths return 200 from the local prepared release.
- Homepage returns 200; retired PD and document-index routes still return 410.
- Unsupported proxy destination returns 400.
- September 15 J.1 staff report renders in the agenda modal: pages 1 and 2 of 3 verified, including a 390px phone viewport.
- Expansion and exit controls work within the embedded agenda frame. Native device fullscreen has not been verified.
- Four shared PDF-reader tests pass (bounded page rendering, unavailable-document fallback, cleanup and fullscreen fallback).
- Viewer and proxy JavaScript syntax checks pass.

## Before publishing

Recheck that production still uses the baseline version above. If it changed, refresh the baseline before preparing another release. Obtain explicit production-deployment approval, then use the targeted configuration, not the repository's regular full-build deployment. After publication, verify the September 15 agenda and the animal-shelter report on the live domain and on an actual phone/tablet. The current task only prepares the update.

## Production deployment

Deployed with explicit user approval on September 14, 2026 (Pacific). Version: 5d7d7ea4-111e-4be1-8182-b0932f14323a. Cloudflare uploaded only the three viewer assets; 86 existing assets were reused. All 82 public-file paths and homepage verified live; retired routes retain 410. September 15 J.1 PDF pages 1 and 2 rendered inside the live agenda, including phone-width verification. The earlier preparation-only status above describes the predeployment checkpoint.

