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
- **Color (nomadic-earth):** warm espresso (`--ink #100b07`) / sun-bleached bone
  (`--paper #e9e0cf`), plus earth accents `--clay #b06a3d`, `--sand #c9a36a`, and forest
  greens `--pine #24321f` / `--moss #6e8259` (owner's service area is pine/oak dense).
  Green lives in exactly two places: the Territory section is deep pine with bone text,
  and the hero topo contours are moss. Don't spread it further without asking.
  Light accents are still LED color temperature via `--glow`: 2700K `#ffab5e`, 3000K `#ffc38a`,
  4000K `#ffe8cf`, plus an RGB (hue-cycling) mode. The hero's "Set the mood" switcher changes
  `--glow` site-wide (glow, cursor, selection, accents).
- **Nomadic/tribal motifs (keep subtle):** clay diamond "trail markers" on eyebrows, marquee
  separators, town lists, and the carousel navigator (diamond beads); zigzag trail-rules under
  section titles; faint kilim diamond lattice on paper sections; stitched square buttons
  (dashed inner border, no pills); stamped corner ticks on gallery photos; diamond-sun brand
  mark + favicon.
- **Type:** Young Serif (display — sturdy, woodcut, single weight 400, **no italics**: accent
  words are colored via `<i>/<em>`, never slanted) + Archivo (body). No system fonts.
- **Topography:** hero contour map is `assets/topo-hero.png` set on `.hero::before` (source art
  `topo-hero.png` at repo root is gray lines on white; processed copy in `assets/` keys the white
  to transparent + tints lines bone). Rendered as a real `<img class="hero__topo">` element in the
  hero (not a background) so it can be freely moved, zoomed AND rotated. Placement lives in the
  `.hero__topo` rule between the `EDITABLE` comment markers: `left`/`top` % (center anchor) +
  `transform: translate(-50%,-50%) rotate() scale()` + `opacity`. **To reposition:** open
  `/topo-placer.html` in a browser — drag/scroll/rotate over a live hero mock, hit Copy CSS, and
  paste the three lines into that EDITABLE block. Opacity auto-drops to `.3` on mobile.
- **Deliberate constraint:** no AI-cliché layouts — no feature-card grids, no gradient overuse.
  Keep new sections inside this language; ornament stays quiet, never theme-park tribal.

## Notable components
- **Custom cursor** — pine-sprig image (`assets/cursor.png`, 32×38, hotspot `12 4`) set via
  `body.cursor-custom` (JS adds it on fine-pointer devices only). A soft kelvin glow aura
  trails it (the `#cursor` div). Source art is `cursor.png` at repo root (988×988, white sprig
  on black); `assets/cursor.png` is the processed version — black keyed to transparent, espresso
  outline baked in for visibility on both bone and pine sections, downscaled. Regenerate with the
  Pillow snippet in git history if the art changes.
- **Header** — transparent over hero; blurred dark scrim on scroll; hides on scroll-down,
  reveals on scroll-up. Brand + footer "Back to the light" scroll to top.
- **Work carousel** (`#workTrack`) — continuous, seamless conveyor. Slides are cloned in JS
  (8 → 16) for an infinite loop; drifts via `requestAnimationFrame`; **no scroll-snap**
  (it fought the motion). **Scrubber bar** below (`#workBar`, one continuous line with a glowing
  highlight segment): hovering/scrubbing a region pauses the drift, glides that photo to center
  and enlarges it (`.slide.is-focus .slide__img` scale); the highlight also tracks the centered
  photo live while drifting. Keyboard arrows on the focused bar step photos. `--seg` = 100/count.
  Track has extra vertical padding so the enlarged photo isn't clipped. Respects reduced-motion.
- **Craft section** — sticky scroll-driven story cycling 2700K → 3000K → 4000K → RGB.
- Two infinite marquees (services strip, footer towns).

## Common edits
- **Contact email** — currently `garcijac000@gmail.com` (mailto in the contact CTA and hero
  meta). Swap to a domain address (e.g. hello@lednomad.com) when it exists. Search `garcijac000`.
- **Add/replace gallery photos** — add optimized image to `assets/gallery/`, then add a
  `<figure class="slide">` in the `#workTrack` block of `index.html` (the JS clones + wires
  the scrubber bar automatically from the slide count; update `#workBar` aria-valuemax too).
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
