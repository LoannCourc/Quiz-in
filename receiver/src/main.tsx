import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadAvatarImages } from './lib/avatarImages'

// Graisses de la DA (theme.css) et images des avatars à charger avant le premier affichage.
const FONT_FACES = ['400 1rem "Bowlby One"', '700 1rem Nunito', '800 1rem Nunito', '900 1rem Nunito']
// Au-delà, on affiche quand même : une police système vaut mieux qu'un écran vide.
const FONT_TIMEOUT_MS = 3000

// Pendant l'attente, seul le fond dégradé du body est visible : pas de flash de police système, ni de
// pastille d'avatar vide.
async function waitForFonts(): Promise<void> {
  const loaded = Promise.all([...FONT_FACES.map((face) => document.fonts.load(face)), preloadAvatarImages()])
  const timeout = new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS))
  try {
    await Promise.race([loaded, timeout])
  } catch (error) {
    console.warn('Polices non chargées, police système utilisée', error)
  }
}

waitForFonts().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
