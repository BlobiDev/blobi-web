# Product

## Platform

web

## Users
Mainly people who used the desktop messengers of the 2000s (contact list in its own window, presence, nudges, tabbed chats) and miss them. They arrive curious and need to understand in a few seconds what Blobi is, that it does not exist as a release yet, and how to hear when it does. Technical XMPP users are a secondary audience.

## Product Purpose
Blobi is a native desktop messenger (Rust + Slint) for Linux, Windows and macOS, built on the open XMPP standard with Prosody as the first server. The website explains the project honestly while it is in development and collects waitlist sign-ups. Success: a visitor understands the idea, tries the in-browser demo, and joins the waitlist.

## Positioning
A respectful evolution of the classic two-window messenger: a narrow contacts window with presence beside a separate tabbed conversations window, on an open federated protocol, without ads or tracking. It evokes the era without copying any existing product's artwork, name or look.

## Operating Context
Visitors read on desktop and phone. The home page carries a scripted conversation demo and a presence control that only change the local preview; nothing is sent anywhere.

## Capabilities and Constraints
- No public release or download exists. Every feature except "this site has no tracking" is in development or planned (`src/content/features/features.yaml`); the site must not claim otherwise.
- Static Astro site served by nginx (Dockerfile). No cookies, analytics or third-party requests.
- EN at `/`, ES at `/es/`; every visible string localized in both.
- Waitlist (owner decision 2026-11-15): a form posting to the project's own endpoint, which does not exist yet. The endpoint is configured at build time; without it the form stays disabled.
- Media (voice, video) is experimental and must not be described as guaranteed.

## Brand Commitments
- Name: Blobi. Official logo, icon and wordmark in `public/brand/` are used unchanged; the icon doubles as the mascot.
- Evokes the warmth of old messenger apps without copying Microsoft (MSN Messenger) artwork, names or interface.

## Evidence on Hand
- Demo contacts and conversations (synthetic, labeled as a scripted demo): `src/content/demo/`.
- Built-in Blobi theme data and art: `src/content/themes/blobi.json`, `public/theme/blobi/`; eight community themes in `gallery.json`.
- No users, testimonials, press, release date, download counts or benchmarks exist. Do not invent them.

## Product Principles
- Honest status first: say what is built, what is in progress and what is planned.
- Show the app working in the browser instead of describing it.
- Privacy is a fact of the site itself, not a slogan.
- Nostalgia for the era, never imitation of a specific product.
