/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EIA_API_KEY: string
  readonly GPU_DB: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 