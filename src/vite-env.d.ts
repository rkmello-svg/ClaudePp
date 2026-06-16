/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_AI: string
  readonly VITE_ENABLE_FISCAL: string
  readonly VITE_ENABLE_MULTICOMPANY: string

  // LLM Provider Configuration
  readonly VITE_LLM_PROVIDER: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_CLAUDE_MODEL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GEMINI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
