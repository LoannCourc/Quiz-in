/// <reference types="vite/client" />

// Variables lues dans receiver/.env (voir .env.example).
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_DATABASE_URL?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  // Développement : « 1 » branche la TV sur les émulateurs locaux (lib/firebase.ts).
  readonly VITE_FIREBASE_EMULATOR?: string
}

// Version de la TV (vite.config.ts) : heure de construction (ISO) et commit.
declare const __BUILD_TIME__: string
declare const __BUILD_COMMIT__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
