# LEDNomad — Handoff

Premium one-page marketing site for **LEDNomad**, a custom LED lighting company in
Eastern Oklahoma. Static HTML/CSS/JS, no build step, deploys to Netlify at **LEDNomad.com**.

## Run locally
Any static server from the project root, e.g.:
```
python3 -m http.server 8642
```
Then open http://localhost:8642. There's a preconfigured `.claude/launch.json` (server name `lednomad`).

## Deploy (Netlify)
Drag-and-drop the whole folder into Netlify, or connect the repo. Config is in
`netlify.toml` (publish dir = `.`, long-cache headers for `/assets/*`, basic security headers).
No environment variables or build command needed.

## File map
```
index.html            All markup, one page (hero → work → craft → services → territory → contact)
css/main.css          Full design system + all styles
js/main.js            All interactions (single IIFE, no dependencies)
favicon.svg           Logo glyph
netlify.toml          Hosting config
Gallery/              ORIGINAL photos (not referenced by the site — source of truth)
assets/gallery/       Web-optimized copies actually used on the page (~1800px, from Gallery/)
```

## Design system (quick reference)
- **Color:** high-contrast black (`--ink #0a0a0a`) / paper (`--paper #f4f2ee`). The *only*
  accent color is LED color temperature, exposed as `--glow`: 2700K `#ffab5e`, 3000K `#ffc38a`,
  4000K `#ffe8cf`, plus an RGB (hue-cycling) mode. The hero's "Set the mood" switcher changes
  `--glow` site-wide (glow, cursor, selection, accents).
- **Type:** Fraunces (display, italic accents) + Archivo (body). No system fonts.
- **Deliberate constraint:** no AI-cliché layouts — no feature-card grids, no gradient overuse.
  Keep new sections inside this language.

## Notable components
- **Custom cursor** (glow dot) — hides the OS cursor via `body.cursor-custom`. Mouse-only.
- **Header** — transparent over hero; blurred dark scrim on scroll; hides on scroll-down,
  reveals on scroll-up. Brand + footer "Back to the light" scroll to top.
- **Work carousel** (`#workTrack`) — continuous, seamless conveyor. Slides are cloned in JS
  (8 → 16) for an infinite loop; drifts via `requestAnimationFrame`; **no scroll-snap**
  (it fought the motion). LED-strip navigator below shows the centered photo and clicking a
  segment glides to it. Pauses on hover/drag/hidden-tab; respects reduced-motion.
- **Craft section** — sticky scroll-driven story cycling 2700K → 3000K → 4000K → RGB.
- Two infinite marquees (services strip, footer towns).

## Common edits
- **Contact email** — currently `garcijac000@gmail.com` (mailto in the contact CTA and hero
  meta). Swap to a domain address (e.g. hello@lednomad.com) when it exists. Search `garcijac000`.
- **Add/replace gallery photos** — add optimized image to `assets/gallery/`, then add a
  `<figure class="slide">` in the `#workTrack` block of `index.html` (the JS clones + wires
  the LED-strip dot automatically from the slide count).
- **Carousel speed** — `SPEED` const in `js/main.js` (px/ms; ~0.045 ≈ 45px/s).
- **Photo orientation** — per owner: leave gallery photos exactly as shot; do not rotate.

## Gotchas
- Continuous-scroll and most micro-interactions are `requestAnimationFrame`-driven. Browser
  tabs pause rAF when backgrounded, so the belt only drifts when the tab is focused/visible
  (expected behavior, not a bug).
- `Gallery/` holds full-res originals and is intentionally *not* linked from the page; the
  site only loads `assets/gallery/`.

## Not built yet / possible next steps
- Real contact form (currently a mailto link) — Netlify Forms is the easy path.
- Per-photo lightbox / detail view.
- Copy is placeholder-quality in places; owner should review installation titles/captions.
