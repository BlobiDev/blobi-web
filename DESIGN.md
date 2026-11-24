---
name: Blobi web
description: Product landing page for an in-development desktop messenger
colors:
  paper: "#ffffff"
  paper-soft: "#f5f8fc"
  rule: "#e3e9f1"
  rule-strong: "#cdd7e4"
  ink: "#0c1a30"
  ink-hover: "#22334f"
  ink-secondary: "#3f5068"
  ink-muted: "#5d6d84"
  blobi-blue: "#1f6fe5"
  blobi-blue-deep: "#1659bd"
  blobi-blue-wash: "#e8f1fe"
  success: "#1d7a3e"
  danger: "#b3261e"
  sky-top: "#7ccbf5"
  grass-light: "#a6e65f"
  grass: "#6fd23f"
  grass-mid: "#3cb34a"
  grass-deep: "#2a8a39"
  grass-ink: "#0b3009"
  presence-online: "#2fb35a"
  presence-away: "#e09a12"
  presence-busy: "#de4a3c"
  presence-offline: "#9aa7b8"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(46px, 6vw, 80px)"
    fontWeight: 720
    lineHeight: 0.98
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 46px)"
    fontWeight: 720
    lineHeight: 1.05
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.45
  app-replica:
    fontFamily: "Noto Sans, sans-serif"
  live-nostalgia-modern:
    fontFamily: "Segoe UI, Selawik, Tahoma, Noto Sans, sans-serif"
rounded:
  control: "10px"
  field: "14px"
  panel: "20px"
  closing: "28px"
spacing:
  gutter: "16px"
  section: "96px"
  section-head: "40px"
  column: "28px"
components:
  button-primary:
    backgroundColor: "{colors.blobi-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.blobi-blue-deep}"
  button-primary-disabled:
    backgroundColor: "{colors.rule-strong}"
    textColor: "{colors.ink-secondary}"
  nav-cta:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "40px"
  input-waitlist:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "54px"
---

# Design System: Blobi web

## Overview
A conventional desktop-app landing page held to Raycast and Arc level finish, chosen on purpose by the owner (2026-11-15). It is framed like the era it remembers: the page opens under a blue sky (Blobi's own `sky.svg` theme art) and closes on a green meadow, at the owner's request for something that recalls 2000s messengers without copying any product's artwork. Between the two, the reading sections stay white and quiet. Restraint is the point: one blue for actions, presence colours only where they mean presence or state.

## Colors
Sky and meadow bookend the page: the hero sits on `sky-top` plus the Blobi `sky.svg` art and fades to `paper`; the waitlist closing sits on a rolling `grass-light`/`grass` crest over a `grass` to `grass-deep` field, with `grass-ink` text, and the footer continues in `grass-deep`. Inside, a restrained strategy: `paper` grounds the reading sections; `paper-soft` marks framed areas (the demo frame, the closing waitlist block, disabled fields). `ink` carries headings, `ink-secondary` body and leads, `ink-muted` notes and counts. `blobi-blue` is reserved for things you can act on (primary button, links, focus ring, selection wash). The four presence colours appear only as presence dots and feature-state lamps, never as decoration.

## Typography
Bricolage Grotesque (the `standard` variable build with width and optical-size axes) for display and section headlines, at `font-stretch: 88%`, weight 720, optical sizing on, balanced wrapping. The H1's closing full stop is the live presence dot: it takes the presence colour the visitor picks in the contacts window (hollow ring for invisible). It is the page's one signature detail; don't repeat it elsewhere. Figtree for everything else on the page. Body measure stays near 46ch in leads. The app replica is isolated from page typography: it uses Noto Sans by default, while Live Nostalgia Modern uses its Segoe UI stack with bundled Selawik fallback, then Tahoma and Noto Sans.

## Layout
Centred `.wrap` of 1200px with a 16px gutter. Hero is a two-column grid (copy, then a 560px product column) that stacks under 1000px. Sections are spaced 96px apart (64px on phones), each opening with a heading block of at most 680px. Feature status uses a sticky heading column on the left and grouped rows on the right (ink rule under each state heading, hairlines between rows); it stacks under 900px.

## Elevation & Depth
Flat page. Depth exists only on the app windows (`shadow-window`: a 1px contact shadow plus a long soft drop) so they read as real windows sitting on the page. The hero overlaps the contacts window over a cropped conversation window that bleeds off the right edge.

## Shapes
Small radii on controls (10px), 14px on the waitlist field, 20px on framed panels, 28px on the closing block. Dots are circles; nothing else is pill-shaped except the app's own UI.

## Components
Waitlist form: a field and button inside one bordered row that gains a blue ring on focus; turns dashed and grey when no endpoint is configured; status line below changes colour for sent and failed. Nav: wordmark, three anchors, project status with an amber dot, EN/ES segmented switch, dark waitlist button. Status column: lamp, state name, count, then name plus one-line summary per feature. Theme tile: a miniature app window in the theme's colours (title bar in its hero gradient, sidebar with an avatar, chat bubbles), 16:9, in a 3×3 grid that becomes a horizontal snap row on phones; name and source below. The demo window floats on the page with its own shadow, without a frame.

## Do's and Don'ts
- The app replica (`AppContacts`, `AppConversation`, `app-replica.css`, `BlobAvatar`) is isolated from page typography: Noto Sans by default, with Live Nostalgia Modern's documented Segoe UI/Selawik fallback stack.
- `success` and `danger` are for waitlist status text only.
- Do show the app instead of describing it; the replica is the hero image.
- Do say plainly what is not built yet; every feature other than the site's own privacy is "in development" or "planned".
- Don't add colour fields, gradients, glass or illustrations to the page around the app.
- Don't add kickers or eyebrows above headings, or icon-plus-heading card grids.
- Don't use presence colours for anything except presence and feature state.
