# AGENTS.md — ml-scenes

Remotion 4 app (TypeScript + Tailwind CSS v4 + npm) for deterministic,
code-driven ML explainer videos. No AI-generated footage: every scene is a pure
function of the frame number, so renders are bit-for-bit reproducible.

## Format

1920x1080, 30fps. Single source of truth: `src/videoConfig.ts`.
A registry entry may override per scene, but prefer the shared config.

## Layout

- `src/scenes/` — scenes by topic: `attention/`, `kv/`, `math/`, `kit/`
- `src/scenes/index.ts` — THE REGISTRY. Each entry auto-becomes a renderable
  `<Composition>` via `src/Root.tsx`, so **every scene renders standalone** —
  the user renders individual scenes and assembles them in CapCut. Editable copy
  lives in the entry's `defaultProps`; keep fallback defaults in the component.
- `src/episodes/` — full videos combining scenes with `<Series>` /
  `<Series.Sequence>` (`AttentionPrimer.tsx`, `KVCache.tsx`). Duration = sum of parts.
- `src/components/shared/` — design system: `theme.ts` (`AP_COLORS`, `AP_FONTS`,
  `AP_TYPE`), `SceneShell`, `ui.tsx`, `TokenCard`, `ScoreGrid`, `NumberVec`,
  `AttentionArc`, `FlowArrow`, `Background`
- `src/components/math/` — the maths + motion toolkit (below)
- `src/videoConfig.ts` — shared FPS / WIDTH / HEIGHT
- `public/` — static assets, referenced as `/asset.png`

## Maths & motion toolkit — `src/components/math/`

Use this for anything that is genuinely maths or needs shape motion. Do **not**
hand-build formulas from monospace spans: the old `shared/MathText.tsx` did that
and produced equations with no fraction bars, radicals or italic variables.
Do not add new usages of `shared/MathText.tsx`; migrate existing ones.

- `Equation` / `Tex` — real KaTeX typesetting. `hl("q", "Q")` tags a subterm;
  pass an `EquationHighlight` to light it up on a given frame. Emphasis uses
  KaTeX `\htmlClass` plus a per-frame CSS rule, so it needs **no DOM
  measurement** and cannot perturb the layout. `x` / `width` place it in a side
  panel; `animateIn={false}` when a parent owns the entrance motion.
- `EquationSteps` — one formula evolving across steps (crossfade + opposing
  drift) with a per-step `note` explaining *why*. Prefer this to cutting.
- `Diagram` / `Curve` / `VectorArrow` / `PointMark` — SVG axes, self-drawing
  curves, growing vectors. Avoid SVG filters; blur is a real render cost.
- `WarpedGrid` + `matrixMap` / `sineWarpMap` — a plane grid pushed through a
  map. A matrix is linear so grid lines stay straight; a non-linear map bends
  them into curves.
- `motion.ts` — the shared motion language. Use `EASE.out`, `TIMING.*`,
  `SPRING_PRESET`, `enterStyle`, `stagger`, `pulse`. Do not invent per-scene
  durations or curves; inconsistent motion is what makes a video feel amateur.
- `color.ts` — `mixHex` / `withAlpha` for frame-driven colour transitions.

## Legibility — non-negotiable

The video is watched on phones, where a 1080p frame is scaled to ~530px or less,
and it is H.264-encoded. Small, thin or low-contrast content is unreadable there.

**Size — err consistently larger.**

- Never introduce a font size below `AP_TYPE.captionMin` (24px). If text does not
  fit at that size, cut the words or split the scene — do not shrink the type.
- Headlines >= 72px, lead lines >= 38px, body >= 30px, captions and labels >= 24px.
- Prefer short copy. Big type plus fewer words beats small type plus a paragraph.
- Size floors are the *minimum*, not the target. When in doubt, go bigger.

**Colour — maximise lightness separation.**

- Text colour must be **as light as possible on a dark background**, and as dark
  as possible on a light one. A mid-tone blue, teal or violet reads as dim grey
  against black — always take the lightest step of a hue that stays
  distinguishable from its neighbours.
- Use `AP_COLORS` tokens, never ad-hoc hex, so a palette change applies everywhere.
- `textMuted` is for de-emphasis only — never for text that must be read.
- Body text weight 600+; labels and chips 700+.
- Add `AP_COLORS.textShadow` to text sitting over busy or glowing areas.
- Contrast floors against `AP_COLORS.bg`: **9:1 for coloured text**, 4.5:1 for
  body text, 3:1 for large/bold. Verify numerically before shipping a new colour.
- Warn the user about low-bitrate re-encodes: thin light-on-dark text is the
  worst case for H.264. Suggest `--crf=16` for final renders.

**Background.**

- The background is pure black (`AP_COLORS.bg`). Keep it flat: no glows, radial
  gradients or colour casts — they compete with the content for luminance and
  measurably reduce contrast. Use `Background` as-is.

## Pacing — no dead frames

Each scene should be **exactly as long as its animation, plus ~1.5s (45 frames) of
buffer**. The user records a facecam over the top and maps timings in CapCut; they
do not need a tail of frozen frames waiting to be cut.

- Do not pad a scene because the narration might need more room.
- Find the last frame any animation uses, add 45, and set `X_DURATION` to that.
- Render time scales with total frames, so dead frames are directly wasted time.

## Workflows

- New scene: create `src/scenes/<group>/X.tsx` exporting `X` + `X_DURATION`,
  register one entry in `src/scenes/index.ts`, render with
  `npm run render -- X out/x.mp4`.
- New video: stack scenes as `<Series.Sequence>` entries, register the episode
  with the summed duration.
- Commands: `npm run dev` (Studio) · `npm run build` (bundle, no browser)
  · `npm run render -- <Id> <out.mp4>` · `npm run still -- <Id> <out.png>`
  · `npm run lint` (= `eslint src && tsc`).

## Rules

- Deterministic animation only: `interpolate` / `spring` / `Sequence` driven by
  `useCurrentFrame()`. Never `Math.random()`, `Date.now()`, or layout measurement.
- TS strict + `noUnusedLocals`. `lib` says `es2015`, but the installed type
  packages pull in up to ES2020, so `includes` / `flat` / `flatMap` / `padStart`
  / `Object.entries` all work fine. ES2021+ does not: `replaceAll`,
  `Array.prototype.at` and `findLast` fail to compile. Verify with `npx tsc`.
- Never name an object property `transition` (including a destructured prop):
  Remotion's `non-pure-animation` lint rule flags any key with that name,
  because it hunts for CSS transitions.
- `AP_FONTS` names Inter and JetBrains Mono but nothing loads them (`public/` is
  empty), so text falls back to system fonts. Do not rely on exact metrics.
- npm only (matches all Remotion docs and `remotion upgrade`).
  `remotion.config.ts` uses the Rspack bundler + `enableTailwind` — keep both lines.
- Prefer fixing `src/components/shared/` over patching a single scene: a fix
  there lands in every video. Do not modify published scenes the user has
  already rendered unless asked.
- Verify before reporting done: `npm run lint` AND `npm run build` must pass.
  Never weaken code to satisfy a self-authored check.

## Environment gotchas (sandboxed agents)

- Default package caches (`~/.npm`, `~/Library/Caches`) may be unwritable or
  proxy-blocked. Redirect them: `export XDG_CACHE_HOME=/tmp/xdg-cache` and
  `npm --cache /tmp/npm-cache`.
- Headless Chrome cannot launch here: `remotion compositions`, `remotion still`
  and `remotion render` all crash. Validate with `npm run build` (pure bundle,
  no browser); real renders happen on the user's machine.
- Consequence: **you cannot see your own output.** Verify geometry, contrast or
  layout numerically instead (bundle a pure module with esbuild and assert on
  it), and say plainly in your reply that the visuals are unverified, with the
  command the user should run to check them.
