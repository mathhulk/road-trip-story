/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_MAPBOX_STYLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// @fontsource/inter 4.x ships no type declarations for its side-effect imports.
declare module "@fontsource/inter";
declare module "@fontsource/inter/*.css";
