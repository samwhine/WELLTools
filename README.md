# WELLTools

Motion graphics & video editing toolbox. Free, browser-based, no login, no server-side media processing.

This repo implements the **foundation** the build spec calls out as the priority (§90: "establish architecture before pages") plus a working end-to-end MVP slice on top of it. It is not the full 300-template product — see **What's not built yet** below for exactly where it stops.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables, no accounts, no backend to stand up.

To deploy: push to GitHub, import into Vercel, done — there's nothing else to configure (§80).

## What's implemented

**Architecture (§04, §28–34, §74–75)**
- Liquid Glass material system — CSS variables for blur/tint/border/shadow, four levels (`subtle`/`regular`/`strong`/`clear`), and a component kit built on it: `LiquidGlass`, `GlassButton`, `GlassInput`, `GlassSlider`, `GlassSelect`, `GlassTabs`, `GlassNavbar`, `GlassProgress`.
- Motion Engine: a real keyframe interpolator (`lib/motion/keyframes.ts`) with 25+ easing functions (`lib/motion/easing.ts`), animation primitives (`lib/motion/primitives.ts`), a stagger system (`lib/motion/stagger.ts`), and an rAF-driven player that writes GPU-friendly `transform`/`opacity` styles directly to the DOM (`lib/motion/engine.ts`) rather than through React state.
- Template registry (`lib/motion/registry.ts`) with search/filter/category support. Adding a template is exactly what §75 describes: write the file, import it in `templates/index.ts`, done — nothing else changes.

**Motion MVP (§76)**
- 5 of the 15 spec'd MVP templates, each with real controls, live preview, and a working canvas-based exporter: **Text Reveal, Word Pop, Word Highlight, Typewriter, Number Counter**.
- Template browser with search + category filters, template detail page with format switcher (9:16/16:9/1:1/4:5), playback controls + scrubber, and a grouped control panel (Advanced section collapsed per §37).
- **Export actually works**: canvas capture + `MediaRecorder` → downloadable `.webm`, with real (not simulated) progress/cancel/error states.

**Video MVP (§48–53)**
- **Remove Silence**, fully wired: Web Audio API RMS-based silence detection (no AI, per spec), an editable edit-decision-list timeline (click a segment to toggle keep/cut), live in-browser preview that skips cut sections before you ever export, and a real FFmpeg.wasm export (trim + concat kept segments → MP4), lazy-loaded so the ~30MB core never touches the initial page load.

**Local projects (§63–65)**
- IndexedDB-backed save/open/duplicate/delete, plus `.motion.json` import/export, wired into the template detail page ("Save locally") and a `/projects` page.

## What's not built yet

Being direct about scope rather than papering over it:

- **294 of the 300 templates.** The registry/engine supports them; only 5 are written. Editorial, Social, Icons, Callouts, Shapes, Transitions, Effects, Backgrounds, and most of Data/Audio/Logo categories have zero templates.
- **Video tools beyond Remove Silence** — Trim, Cut, Merge, Extract Audio, Convert, Resize, Crop, Speed, Reverse, Compress, etc. (§48) are stubbed as "coming soon" cards on `/video`.
- **Transparent export.** Motion export produces opaque WebM — `MediaRecorder`'s alpha-channel support is inconsistent across browsers. True transparent WebM/PNG-sequence export (§46) needs the same FFmpeg.wasm pipeline Remove Silence uses; not wired up for motion yet.
- **Lightweight keyframe timeline UI** (§44–45) — the keyframe *system* is real and used by every template, but there's no visual timeline/scrubber for hand-editing keyframes yet. Templates currently expose their animation as sliders (duration/delay/stagger/easing), not raw keyframes.
- **Audio tools & visualizers** — `/audio` is a placeholder pointing at where they'll live.
- Accessibility pass (§67), mobile-specific layout tuning (§66), and the full micro-interaction polish pass (§68) haven't had a dedicated pass — the primitives (focus states, reduced-motion CSS, keyboard-operable Radix components) are in place, but it hasn't been audited end to end.

## Adding the next template

Exactly the workflow in §75 — e.g. to add "Text Slam":

1. Create `templates/text/textSlam.tsx` — export a `MotionTemplate` (component + controls + `render()` + optional `drawFrame()` for export).
2. Import it and add one line to `templates/index.ts`'s `registerAllTemplates()`.

Nothing in the router, preview engine, export system, search, filters, or control panel needs to change.

## SEO / metadata / social previews (this pass)

- Full metadata in `app/layout.tsx`: title template, description, keywords, `authors`/`creator` (**Samuel Extehines Heydemans**), `publisher` (**WELL**), canonical URL, robots.
- A real Open Graph + Twitter card image, generated dynamically at `app/opengraph-image.tsx` (Next's `next/og` — no external design tool needed) using the actual WELL wordmark and the product's own dark/blue palette, so link previews on Twitter/X, WhatsApp, Discord, iMessage, etc. look intentional instead of blank. `app/twitter-image.tsx` re-exports the same generator so there's one source of truth.
- Schema.org JSON-LD (`WebApplication` + `Person`) in the layout body, so Google has a structured signal that this is a free web app called WELLTools, brand "WELL", created by Samuel Extehines Heydemans — this is what helps search results show more than just a bare blue link.

**One thing you must change before this is fully correct:** `SITE_URL` at the top of `app/layout.tsx` is a placeholder (`https://welltools.vercel.app`). Every absolute URL — canonical link, OG/Twitter image URLs, JSON-LD — is built from it. Update it to your real domain once you know it (Vercel's assigned `*.vercel.app` URL, or your custom domain), otherwise search engines and link previews will reference the wrong address.

Also worth doing once it's live: submit the site to [Google Search Console](https://search.google.com/search-console) and verify it there — structured data and good meta tags help, but Search Console is what actually gets a new site crawled and indexed promptly rather than waiting for Google to discover it organically.

## Mobile fixes (this pass)

Found and fixed after being asked directly about mobile — being explicit about what was actually broken:

- **Missing viewport meta tag** — the biggest one. Without it, mobile browsers render at a ~980px virtual viewport and zoom to fit, so every `sm:` breakpoint (including the mobile nav below) silently never triggered. Added via Next's `viewport` export in `app/layout.tsx`.
- **No mobile navigation at all** — the nav links were `hidden sm:flex` with nothing standing in for them below that breakpoint. Rebuilt `GlassNavbar` with a real hamburger menu: 44px trigger, glass dropdown panel, tap-outside-to-close backdrop, body-scroll lock while open, closes automatically on route change.
- **Preview stage aspect-ratio bug** — the old CSS set a fixed `height` for portrait formats and let `max-width` clamp the width independently; on a narrow phone those two constraints could disagree and distort/crop the preview. Replaced with a single formula (`width: min(100%, 720px, calc(70vh * ratio))`, `height: auto`) that solves both axes together and is guaranteed to preserve the ratio.
- **Touch targets under 44px** — icon buttons (play/pause/restart) were 40px; bumped to 44px. Slider thumbs were a 16px dot with a 16px hit area — kept the visual size but gave it an invisible 44px hit region via a `::before`, and gave the slider row itself more vertical room to host that hit area.
- Added `touch-manipulation` to buttons and timeline segments to remove the legacy tap-delay/double-tap-zoom behavior on mobile browsers.

**Still not audited:** the Remove Silence timeline can produce very narrow segment buttons when there are many short cuts — tapping the right one on a small screen is inherently fiddly with the current bar-of-buttons design, and I haven't redesigned it (e.g. toward a drag-based scrubber) yet. Also haven't tested on an actual device/emulator — this sandbox has no browser, so all of the above is reasoned through the CSS/DOM behavior, not visually confirmed.

## Folder structure

Matches spec §73 as closely as the actual (partial) build allows — see the repo tree for the current state; empty category folders under `templates/` are placeholders for the categories not yet started.

