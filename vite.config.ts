import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig, type Plugin } from "vite";

// GitHub Pages has no server-side routing, so a direct link such as /story/3
// would 404. Pages serves 404.html for unknown paths, so make that the app too
// and let the router take over.
function singlePageFallback(): Plugin {
  let outDir = "dist";

  return {
    name: "single-page-fallback",
    apply: "build",
    configResolved: config => {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle: () => {
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // The site is served from https://<user>.github.io/road-trip-story/. Override
  // with BASE_PATH (e.g. "/" for a custom domain).
  base: process.env.BASE_PATH ?? (command === "build" ? "/road-trip-story/" : "/"),

  plugins: [vue(), singlePageFallback()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },

  build: {
    // mapbox-gl alone is larger than the default 500 kB warning threshold.
    chunkSizeWarningLimit: 2500
  }
}));
