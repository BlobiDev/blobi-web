# Blobi trademarks and brand assets

The source code of this repository is MIT licensed (see `LICENSE`). The **Blobi brand identity** is not: it is Copyright (c) 2026 blobidev, all rights reserved, and is licensed only as described here.

## What is covered

- The name **Blobi** used as the name of a product, service, site, company, package or domain.
- The logo, the icon (which doubles as the mascot) and the wordmark, in these files:

| File | Content |
|---|---|
| `public/brand/blobi-icon.svg` | icon / mascot |
| `public/brand/blobi-logo.svg` | logo |
| `public/brand/blobi-wordmark.svg` | wordmark |
| `public/brand/blobi-128.png`, `public/brand/blobi-512.png` | raster icon |

## What is NOT covered (MIT, or the owner's own license)

All source code; the page layouts, styles and scripts; the demo content (`src/content/demo/`), the theme data and the theme artwork in `public/theme/` (these are generic, not brand identity); the generated contact avatars; and third-party material, such as the Selawik font (SIL OFL, `public/fonts/selawik/OFL.txt`) and npm dependencies, which keep their own licenses.

## What you may do without asking

- Clone the repository, build and view the site locally, with the brand files unchanged, to develop, test, review or audit it, and to prepare contributions (including a private or public fork used only to open pull requests).
- Quote or screenshot the unmodified assets when reviewing, reporting on or discussing the Blobi project.
- Refer to Blobi by name in plain text to say truthfully what you are talking about.

## What requires written permission

- Using the brand assets or the name as the identity of your own product, site, fork, package, organisation, app, domain or social account, or in any way that suggests your work is Blobi or is endorsed by or affiliated with it.
- Distributing or deploying a build or fork that still contains the brand assets or the name as its own identity.
- Modifying, recolouring, redrawing or animating the assets, creating look-alikes, or using them on merchandise.

To ask for permission, open an issue in this repository.

## Building and running a fork without the brand

The build needs the files to exist, not to be Blobi's. To publish a fork under another identity, replace the five files in `public/brand/` with your own (same paths; the site uses `blobi-icon.svg` as favicon, header mark and mascot and `blobi-logo.svg` in the contacts window; the other three files are not referenced by the source), and replace the name "Blobi" in `src/i18n/en.json`, `src/i18n/es.json` and `src/content/` text. Tests, type checking and the build pass with the five files replaced by placeholders (verified). Nothing else in the repository is a brand asset.

## Nothing here grants rights to other marks

This file grants no rights to any third party's trademarks. The site deliberately does not copy the artwork, names or look of any existing product.
