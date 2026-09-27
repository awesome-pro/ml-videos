import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Config for the presenter deck only (`npm run deck`). The video itself is built
// by the Remotion CLI, which never looks at this file.
//
// Kept as `.mjs` on purpose: `tsc` does not pick up JS without `allowJs`, so the
// deck's config stays out of the typecheck while `deck/*.tsx` is fully checked.
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(root, "deck"),
  base: "./",
  // The deck renders the real scenes, so it needs the real stylesheet — the
  // same Tailwind v4 pipeline the video is bundled with.
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  build: {
    outDir: path.join(root, "deck-dist"),
    emptyOutDir: true,
  },
});
