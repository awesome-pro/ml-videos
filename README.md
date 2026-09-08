# ML Scenes — deterministic explainer videos with Remotion

Code-driven scenes for ML research explainers. No AI-generated footage:
every pixel is a pure function of the frame number, so renders are
bit-for-bit reproducible.

Format defaults: **1920x1080, 30fps** — see [src/videoConfig.ts](src/videoConfig.ts).

## Daily workflow

```bash
npm run dev                        # open Remotion Studio (scene picker + live preview)
npm run render -- Episode01 out/episode01.mp4   # render a scene or episode
npm run still -- TitleScene out/title.png       # export one frame (thumbnails)
npm run lint                       # eslint + typecheck
npm run build                      # bundle without rendering
```

## Create a scene

1. Add `src/scenes/MyScene.tsx` exporting `MyScene` and `MY_SCENE_DURATION`.
   Copy `TitleScene.tsx` — keep animation a pure function of
   `useCurrentFrame()` (use `interpolate`/`spring`/`Sequence`, never
   `Math.random()` or `Date.now()`).
2. Register one entry in `src/scenes/index.ts`. It shows up in Studio
   immediately and renders as `npm run render -- MyScene out/my-scene.mp4`.

## Combine scenes into a video

Stack scenes with `<Series.Sequence>` — see
[src/episodes/Episode01.tsx](src/episodes/Episode01.tsx) — then register the
episode in `src/scenes/index.ts` with the summed duration.

## Project layout

- `src/scenes/` — reusable one-idea scenes (`TitleScene`, `BulletScene`)
- `src/episodes/` — combined videos built from scenes via `<Series>`
- `src/scenes/index.ts` — the registry: every entry becomes a renderable composition
- `src/videoConfig.ts` — shared fps / resolution
- `public/` — static assets (images, fonts) referenced as `/asset.png`
