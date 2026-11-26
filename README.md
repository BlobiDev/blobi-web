# Blobi website

Source of the blobi.dev website. It needs no other repository to build, test or run.

Astro static site using Tailwind CSS v4 and strict TypeScript. English is served at `/` and Spanish at `/es/`. Brand files and the single built-in theme's light/dark data and artwork are copied from the official Blobi assets, already copied into `public/` for local serving. No external fonts, scripts, avatars, analytics, or runtime requests are used.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
pnpm preview --host 127.0.0.1
```

Use `astro preview` for screenshots and visual QA. `dist/` is static output; the Docker image serves it with nginx.

## Publishing the image

`.github/workflows/publish.yml` is manual (`workflow_dispatch`), runs only on `main` and pushes the image by digest, scans that digest and only then tags it `ghcr.io/blobidev/blobi-web:sha-<full commit sha>`; it never moves `:main`. It fails if a `PUBLIC_WAITLIST_*` variable is empty. The digest is in the run summary and in the `publish-record` artifact: deploy by digest (`ghcr.io/blobidev/blobi-web@sha256:…`), never by tag. A failed scan leaves an untagged image in the registry. Deployment is not part of this repository, and no image built from it should be deployed before the dependency upgrade has been reviewed (`docs/SECURITY-ADVISORIES.md`).

## Waitlist form

The form posts directly to a Listmonk instance (the examples use `list.example.org`; the real host is a build setting, not part of the source). No JavaScript is involved. Settings are read at build time by `src/lib/waitlist.mjs` and tested in `tests/waitlist.test.mjs`:

| Variable | Value | Default |
|---|---|---|
| `PUBLIC_WAITLIST_ENDPOINT` | `https://list.example.org/subscription/form` (must be https and end in `/subscription/form`) | empty: form shown disabled, no outgoing requests |
| `PUBLIC_WAITLIST_LIST_EN` | UUID of the English Listmonk list | required when the endpoint is set |
| `PUBLIC_WAITLIST_LIST_ES` | UUID of the Spanish Listmonk list | required when the endpoint is set |

In CI they come from the GitHub repository **variables** of the same names (Settings → Secrets and variables → Actions → Variables) and reach the build through `ARG`s in the `Dockerfile`. None of them is secret.

The form sends `email`, `l` (the list for the page language), `nonce` (an off-screen honeypot Listmonk rejects when filled) and `next`. Listmonk redirects to `next` only when it matches a trusted URL exactly. In Listmonk, under Settings → Security, add `https://blobi.dev/thanks/` and `https://blobi.dev/es/gracias/` as trusted URLs. Without them, visitors see Listmonk's own confirmation page instead. Both lists must be public with double opt-in. Do not expose Listmonk's `/api/public/subscription`: it skips the honeypot and captcha checks.

```sh
PUBLIC_WAITLIST_ENDPOINT=https://list.example.org/subscription/form \
PUBLIC_WAITLIST_LIST_EN=<uuid> PUBLIC_WAITLIST_LIST_ES=<uuid> pnpm build
```

## Content ownership

Feature names, claims, details, and states come from `src/content/features/features.yaml`; all visitor-facing copy and demo scripts are localized in `src/i18n/en.json` and `src/i18n/es.json`. Feature states are conservative seeds with maintainer TODOs; update them only after the corresponding behavior is verified. The website privacy policy is the only feature marked available. Theme preview colors and art are sourced from the mirrored built-in `src/content/themes/blobi.json` and `public/theme/blobi/` assets.

The official `blobi-icon.svg` is used unchanged for the brand and mascot. TODO: if the maintainer supplies a separately approved mascot asset for larger placements, evaluate it without altering the current official artwork.

## Implementation roadmap

Version 2 (2026-11-15) replaced the Daylight design with a conventional product landing page; Product context lives in `PRODUCT.md`, the visual system in `DESIGN.md`.

| Phase | Remaining scope |
|---|---|
| 1. Foundations | Home foundations are in place: Astro/Tailwind/strict TS, EN/ES routes, shared shell, tokens, localized copy, and a validated feature registry. Broader page routes, MDX, sitemap, and CI remain future work. |
| 2. Window system and static Home | Daylight window system and registry-backed Home are implemented with official branding and built-in theme previews. |
| 3. Interactions | Home presence, contact tour, conversation scripts, tabs, quick replies, replay, nudge, drag, toast and reduced-motion behavior are implemented; finish broad automated/accessibility verification. |
| 4. Product pages | Features, downloads, themes gallery, About and localized 404 pages, all rendered from registry/release data. |
| 5. Blog and docs | MDX collections, RSS, Pagefind, localized content and translation fallbacks. |
| 6. Quality and Evening | Dark site variant, full-page accessibility/performance budgets, cross-browser and assistive-technology checks. |
| 7. Deployment preparation | Deployment proposal for maintainer review. |

## Invitation pages

`/invite/` (EN) and `/es/invitacion/` (ES) show the state of an early-access invitation. The token travels in the URL fragment (`/invite/#<token>`), which browsers never send to a server, so it stays out of nginx and Cloudflare logs and the `Referer`. The page reads it, removes it from the address bar and sends it in a POST body to the invitation service (the `blobi-invites` repository). The pages are `noindex` and `no-referrer`.

`PUBLIC_INVITES_API` (build argument, optional) is the https origin of that service, for example `https://api.example.org`. `http://localhost:…` is accepted for development. When it is empty the page says invitations cannot be checked and ships no script, so it makes no request. It has nothing to do with the waitlist settings. `publish.yml` reads it from the repository variable of the same name.

## Configuration summary

`.env.example` lists every build-time variable (`PUBLIC_WAITLIST_*`, `PUBLIC_INVITES_API`); all are public and optional. Nothing is read at runtime: the image is static nginx.

## Known dependency advisories

`pnpm audit` reports none at the time of writing (24 before the Astro 7 upgrade); see `docs/SECURITY-ADVISORIES.md`.

## License

The source code is released under the MIT License (`LICENSE`). **The Blobi name, logo, icon, mascot and wordmark (`public/brand/`) are excluded from the MIT License** and may be used only as `TRADEMARKS.md` permits; they are kept in the repository so the site builds and renders as intended. The theme data and artwork in `public/theme/` and the demo content are not brand assets. The bundled Selawik font keeps its own license (`public/fonts/selawik/OFL.txt`).
