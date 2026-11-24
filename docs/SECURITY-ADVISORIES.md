# Dependency advisories

`pnpm audit` on 2026-11-24 against the previous lockfile reported **24 advisories** (1 critical, 7 high, 11 moderate, 5 low): Astro 5.15.3 (1 critical, 3 high, 11 moderate, 5 low), Sharp 0.34.5 (3 high) and Zod 3.25.76 (1 high).

## Remediation in this snapshot

| Package | Before | Now |
|---|---|---|
| astro | 5.15.3 | 7.4.13 |
| zod | 3.25.76 | 4.6.7 |
| sharp (transitive, optional) | 0.34.5 | 0.35.5 |
| vite (transitive) | 6.x | 8.3.8 |
| tailwindcss, @tailwindcss/vite | 4.1.17 | 4.3.5 (4.1.17 does not declare Vite 8 support) |
| @astrojs/check | 0.9.4 | 0.9.12 |

`pnpm audit` now reports **no known vulnerabilities**. Nothing was ignored, overridden or silenced. Code change: `src/content.config.ts` imports `z` from `zod` instead of the deprecated `astro:content` export.

Checked after the upgrade: 12/12 tests, `astro check` 0 errors/warnings/hints, build of 6 pages, Docker build, and headless-Chrome screenshots of `/`, `/es/`, `/invite/` and `/thanks/` compared pixel by pixel with the previous build (differences: none visible, at most a fraction of one pixel).

## Container image

An independent Trivy 0.76.2 scan (vulnerability DB 2026-11-24, OS packages and libraries, no ignore files) of the previous production stage, `nginxinc/nginx-unprivileged:1.30.6-alpine` plus `dist/`, found **5 critical and 15 high** entries, all in Alpine/nginx packages of the base (nginx 1.30.6, brotli, libexpat, libxslt, libxml2, curl, musl, zlib), none in Astro, Sharp or the site. The newest published tags of the base (`stable-alpine` = the pinned digest; `1.31` mainline) did not fix them.

Remediation in the `Dockerfile` production stage: remove the four unused nginx modules (geoip, image-filter, njs, xslt), `apk upgrade`, and install nginx 1.30.7 from the Alpine repository (the modules pinned nginx to 1.30.6). The nginx configuration, port 8080 and the unprivileged user (uid 101) are unchanged. Result of the same scan on the built image: **0 vulnerabilities of any severity**. Verified: all six pages, assets and the 404 answer as before, access/error logs reach stdout, `nginx -t` passes.

Limits: the fix is applied at build time, so the image is identified by its digest and a rebuild may differ; replace the step with a newer pinned base once one scans clean. Scans are point-in-time. The build stage (`node:22.23.5-alpine`, with its bundled npm) still carries advisories in npm's own packages; it is not shipped. Sharp 0.35.5 (latest published) bundles libvips/libexpat in its native build: that is build-time only, nothing in the site uses `astro:assets` or processes images at request time, and no newer Sharp exists; do not feed untrusted images to the build.

## Limits

- `pnpm audit` is a point-in-time check against the npm advisory database; new advisories will appear. The CI `audit` job fails on high or critical advisories.
- Base images (Node, nginx) are digest-pinned and not scanned here.
- The site is static output served by nginx; the exposure was the build toolchain, not the runtime.

## Deployment gate

An image built from this repository must not be deployed until the upgrade has been independently reviewed and the built image accepted functionally and visually (see the migration runbook). Publishing the sources is not blocked.
