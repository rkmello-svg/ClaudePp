/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_AI: string
  readonly VITE_ENABLE_FISCAL: string
  readonly VITE_ENABLE_MULTICOMPANY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
