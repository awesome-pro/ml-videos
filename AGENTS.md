# AGENTS.md — ml-scenes

Remotion 4 app (TypeScript + Tailwind CSS v4 + npm) for deterministic,
code-driven ML-research explainer videos. No AI-generated footage:
every scene must be a pure function of the frame number so renders
are bit-for-bit reproducible.

## Format

1920x1080, 30fps. Single source of truth: `src/videoConfig.ts`.
A registry entry may override per scene, but prefer the shared config.

## Layout

- `src/scenes/` — reusable one-idea scenes (`TitleScene`, `BulletScene`)
- `src/scenes/index.ts` — THE REGISTRY. Each entry auto-becomes a
  renderable `<Composition>` via `src/Root.tsx`. Editable copy lives in
  the entry's `defaultProps` (shows in Studio's props panel); keep
  fallback defaults in the component's own params.
- `src/episodes/` — full videos combining scenes with `<Series>` /
  `<Series.Sequence>` (see `Episode01.tsx`). Episode duration = sum of parts.
- `src/videoConfig.ts` — shared FPS / WIDTH / HEIGHT
- `public/` — static assets, referenced as `/asset.png`

## Workflows

- New scene: create `src/scenes/X.tsx` exporting `X` + `X_DURATION`,
  register one entry in `src/scenes/index.ts`, preview with
  `npm run dev`, render with `npm run render -- X out/x.mp4`.
- New video: stack scenes as `<Series.Sequence>` entries, register the
  episode with the summed duration.
- Commands: `npm run dev` (Studio) · `npm run build` (bundle, no browser)
  · `npm run render -- <Id> <out.mp4>` · `npm run still -- <Id> <out.png>`
  · `npm run lint` (= `eslint src && tsc`).

## Rules

- Deterministic animation only: `interpolate` / `spring` / `Sequence`
  driven by `useCurrentFrame()`. Never `Math.random()`, `Date.now()`,
  or layout measurement.
- TS strict + `noUnusedLocals`. Style with Tailwind v4 classes; inline
  `style` only for frame-driven values (opacity / transform).
- npm only (matches all Remotion docs and `remotion upgrade`).
  `remotion.config.ts` uses the Rspack bundler + `enableTailwind` —
  keep both lines.
- Verify before reporting done: `npm run lint` AND `npm run build`
  must pass. Never weaken code to satisfy a self-authored check.

## Environment gotchas (sandboxed agents)

- Default package caches (`~/.npm`, `~/Library/Caches`) may be
  unwritable or proxy-blocked. Redirect them:
  `export XDG_CACHE_HOME=/tmp/xdg-cache` and `npm --cache /tmp/npm-cache`.
- `npx create-video` template download fails here (proxy-ignorant
  `https.get` in its degit helper). Equivalent fallback: curl the
  template tarball
  (`https://github.com/remotion-dev/template-empty/archive/HEAD.tar.gz`),
  extract with `strip-components=1`, then apply the Tailwind v4 steps
  from https://www.remotion.dev/docs/tailwind.
- Headless Chrome cannot launch in the sandbox: `remotion compositions`
  and `remotion render` crash here. Validate with `npm run build`
  (pure bundle, no browser); real renders happen on the user's machine,
  where Chrome auto-downloads on first render.
