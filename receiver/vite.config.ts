import react from '@vitejs/plugin-react'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

import { MUSIC_FILE_MAX_BYTES, MUSIC_TOTAL_MAX_BYTES, MUSIC_TRACKS } from '../shared/musicTracks.ts'

const megabytes = (bytes: number) => `${(bytes / 1_048_576).toFixed(2)} Mo`

// Musiques de la TV (spec 17) : jamais versionnées, déposées dans public/music/ avant le déploiement.
// Le build avertit, sans bloquer : piste absente (silence sur la TV), fichier trop lourd, total trop
// lourd, ou fichier inattendu qui serait publié avec la TV.
function musicCheck(): Plugin {
  const directory = fileURLToPath(new URL('./public/music/', import.meta.url))
  return {
    name: 'quizin-music-check',
    apply: 'build',
    buildStart() {
      const expected = new Set(Object.values(MUSIC_TRACKS).map((track) => track.file))
      const present = existsSync(directory) ? readdirSync(directory).filter((name) => !name.startsWith('.')) : []
      let total = 0
      for (const file of present) {
        const size = statSync(directory + file).size
        total += size
        if (!expected.has(file)) this.warn(`Fichier inattendu, publié avec la TV : public/music/${file} (${megabytes(size)})`)
        else if (size > MUSIC_FILE_MAX_BYTES) this.warn(`Musique trop lourde : ${file}, ${megabytes(size)} (limite ${megabytes(MUSIC_FILE_MAX_BYTES)})`)
      }
      for (const file of expected) {
        if (!present.includes(file)) this.warn(`Musique absente : public/music/${file} (silence sur la TV)`)
      }
      if (total > MUSIC_TOTAL_MAX_BYTES) this.warn(`Musiques : ${megabytes(total)} en tout (limite ${megabytes(MUSIC_TOTAL_MAX_BYTES)})`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), musicCheck()],
  // Box de test (Bouygues, Android TV) : navigateur Cast basé sur Chrome 92. La syntaxe JS et CSS
  // plus récente est retranscrite pour lui.
  build: {
    target: 'chrome92',
  },
  resolve: {
    // Même alias que dans tsconfig.app.json et dans app/ : types et constantes communs.
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
