import { html } from './html.mjs'

// Petits dessins en bas des cartes de jeu (champ "motif" de data/games.json), décoratifs.
export const MOTIFS = {
  answers: html`<div class="motif-answers" aria-hidden="true"><span class="ink"></span><span class="pink"></span><span class="cyan"></span><span class="white"></span></div>`,
  lines: html`<div class="motif-lines" aria-hidden="true"><span class="white w90"></span><span class="white w70"></span><span class="ink w80"></span></div>`,
  scribble: html`<svg class="motif-svg motif-scribble" viewBox="0 6.5 300 48" aria-hidden="true"><path d="M10 36c34-34 58 20 92-4s58-26 92 2 61 6 95-10" fill="none" stroke="#1a0a4d" stroke-width="6" stroke-linecap="round"/></svg>`,
  equalizer: html`<svg class="motif-svg" viewBox="0 0 200 48" aria-hidden="true"><g fill="#ffffff"><rect x="10" y="22" width="12" height="22" rx="6"/><rect x="34" y="8" width="12" height="36" rx="6"/><rect x="58" y="16" width="12" height="28" rx="6"/><rect x="82" y="2" width="12" height="42" rx="6"/><rect x="106" y="14" width="12" height="30" rx="6"/><rect x="130" y="24" width="12" height="20" rx="6"/><rect x="154" y="10" width="12" height="34" rx="6"/><rect x="178" y="26" width="12" height="18" rx="6"/></g></svg>`,
}
