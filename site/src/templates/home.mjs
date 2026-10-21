import { html } from './html.mjs'
import { MOTIFS } from './motifs.mjs'
import { ctaStoreButtons, heroStoreButtons } from './stores.mjs'

// QR code décoratif (pas un vrai lien) de l'illustration.
const QR = html`<svg class="tv-qr-code" viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true"><rect width="21" height="21" fill="#fff"/><g fill="#14064a"><path d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0z"/></g><g fill="#fff"><path d="M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z"/></g><g fill="#14064a"><path d="M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2z"/><path d="M8 0h2v2H8zM11 1h2v2h-2zM8 3h1v3H8zM10 4h3v1h-3zM9 7h2v2H9zM12 7h2v1h-2zM0 8h3v1H0zM4 8h2v2H4zM1 10h2v2H1zM5 11h3v1H5zM8 10h1v3H8zM10 9h3v2h-3zM14 8h2v2h-2zM17 8h3v1h-3zM18 10h2v2h-2zM15 11h2v2h-2zM9 14h2v2H9zM12 13h2v2h-2zM14 14h3v1h-3zM17 14h2v2h-2zM10 17h3v1h-3zM8 18h1v3H8zM11 19h2v2h-2zM14 17h2v3h-2zM17 18h3v1h-3zM18 20h3v1h-3z"/></g></svg>`

export function illustration(h) {
  return html`<div class="hero-art" role="img" aria-label="${h.illustrationAlt}">
<div class="art" aria-hidden="true">
<div class="tv">
<div class="tv-screen">
<div class="tv-code">
<span class="tv-game">${h.tvGame}</span>
<span class="tv-label">${h.tvCode}</span>
<span class="tv-digits">FM57</span>
<div class="tv-avatars"><span class="yellow">L</span><span class="cyan">M</span><span class="pink">S</span><span class="empty"></span></div>
</div>
<div class="tv-qr">${QR}<span>${h.scanToPlay}</span></div>
</div>
</div>
<div class="tv-neck"></div>
<div class="tv-foot"></div>
<div class="phone">
<span class="phone-notch"></span>
<span class="phone-avatar">C</span>
<span class="phone-title">${h.joinTitle}</span>
<span class="phone-field">${h.joinName}</span>
<span class="phone-button">${h.joinGo}</span>
</div>
</div>
</div>`
}

function hero(ctx) {
  const h = ctx.t.home
  return html`<section class="hero wrap">
<div class="hero-text">
<h1 class="hero-title">${h.heroTitle}</h1>
<p class="hero-sub">${h.heroSub}</p>
<div id="telecharger" class="hero-stores">
${heroStoreButtons(ctx)}
</div>
<p class="hero-meta">${h.heroMeta}</p>
</div>
${illustration(h)}
</section>`
}

const STEP_COLORS = ['yellow', 'cyan', 'pink']

function steps(ctx) {
  const h = ctx.t.home
  return html`<section id="comment" class="section wrap">
<h2 class="section-title">${h.stepsTitle}</h2>
<p class="section-sub">${h.stepsSub}</p>
<ol class="steps">
${h.steps.map((step, index) => html`<li class="card step"><span class="step-number ${STEP_COLORS[index % STEP_COLORS.length]}" aria-hidden="true">${index + 1}</span><h3>${step.title}</h3><p>${step.text}</p></li>
`)}</ol>
</section>`
}

// Jeux affichés : visible, et l'indicateur de config.json demandé par "requires" (showBlindTest).
export function visibleGames(config, games) {
  return games.filter((game) => game.visible && (!game.requires || config[game.requires] === true))
}

function gamesSection(ctx) {
  const { t, config, games } = ctx
  const h = t.home
  return html`<section id="jeux" class="section wrap">
<h2 class="section-title">${h.gamesTitle}</h2>
<ul class="games">
${visibleGames(config, games).map((game) => html`<li class="game-card game-card--${game.id}">
<h3>${game.name[t.lang]}</h3>
<p>${game.description[t.lang]}</p>
<div class="game-motif">${MOTIFS[game.motif] ?? ''}</div>
</li>
`)}</ul>
<div class="games-soon"><span class="games-soon-title">${h.soonTitle}</span><span>${h.soonText}</span></div>
</section>`
}

const PERSON_ICON = html`<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>`
const GROUP_ICON = html`<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8.5" r="3.3"/><circle cx="16.5" cy="9.5" r="2.8"/><path d="M1.5 20c0-3.6 2.8-5.8 6.5-5.8s6.5 2.2 6.5 5.8zM15 14.6c3.6-.4 7.5 1 7.5 5.4H16c0-2.2-.4-3.9-1-5.4z"/></svg>`
const BAND_STYLES = [
  { color: 'yellow', icon: null },
  { color: 'cyan', icon: PERSON_ICON },
  { color: 'pink', icon: GROUP_ICON },
]

function band(ctx) {
  return html`<section class="section wrap">
<ul class="band">
${ctx.t.home.band.map((item, index) => {
    const style = BAND_STYLES[index % BAND_STYLES.length]
    return html`<li class="band-item"><span class="band-badge ${style.color}" aria-hidden="true">${style.icon ?? item.badge}</span><span class="band-text"><span class="band-title">${item.title}</span><span class="band-desc">${item.text}</span></span></li>
`
  })}</ul>
</section>`
}

function faq(ctx) {
  const h = ctx.t.home
  return html`<section id="faq" class="section section-narrow wrap">
<h2 class="section-title">${h.faqTitle}</h2>
<div class="faq">
${h.faq.map((item) => html`<details class="card faq-item"><summary>${item.q}</summary><p>${item.a}</p></details>
`)}</div>
<p class="faq-more">${h.faqMore} <a href="${ctx.t.paths.help}">${h.faqMoreLink}</a></p>
</section>`
}

function cta(ctx) {
  return html`<section class="section cta wrap">
<h2 class="cta-title">${ctx.t.home.ctaTitle}</h2>
<div class="cta-buttons">
${ctaStoreButtons(ctx)}
</div>
</section>`
}

export function homeMain(ctx) {
  return html`${hero(ctx)}
${steps(ctx)}
${gamesSection(ctx)}
${band(ctx)}
${faq(ctx)}
${cta(ctx)}`
}
