import { html } from './html.mjs'

// Boutons des stores : lien de config.json, ou page « Bientôt disponible » tant qu'il vaut null
// (et « Bientôt sur » à la place de « Disponible sur »).
function storeLink(ctx, store) {
  const url = ctx.config.storeLinks[store]
  return url ? html`href="${url}" rel="noopener"` : html`href="${ctx.t.paths.soon}"`
}

function isAvailable(ctx, store) {
  return Boolean(ctx.config.storeLinks[store])
}

const PLAY_ICON = html`<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3l15 9-15 9z"/></svg>`
const DOWNLOAD_ICON = html`<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>`

function heroButton(ctx, store, className, icon, name) {
  const { stores } = ctx.t
  const prefix = isAvailable(ctx, store) ? stores.availableOn : stores.comingSoonOn
  return html`<a class="pill ${className} store-button" ${storeLink(ctx, store)}>${icon}<span class="store-text"><span class="store-prefix">${prefix}</span> <span class="store-name">${name}</span></span></a>`
}

export function heroStoreButtons(ctx) {
  const { stores } = ctx.t
  return html`${heroButton(ctx, 'googlePlay', 'pill-yellow', PLAY_ICON, stores.googlePlay)}
${heroButton(ctx, 'appStore', 'pill-pink', DOWNLOAD_ICON, stores.appStoreLong)}`
}

// Boutons de l'appel final : nom du store seul ; « Bientôt sur » est lu par les lecteurs d'écran.
function ctaButton(ctx, store, className, name) {
  const { stores } = ctx.t
  const hint = isAvailable(ctx, store) ? '' : html`<span class="visually-hidden">${stores.comingSoonOn} </span>`
  return html`<a class="pill ${className}" ${storeLink(ctx, store)}>${hint}${name}</a>`
}

export function ctaStoreButtons(ctx) {
  const { stores } = ctx.t
  return html`${ctaButton(ctx, 'googlePlay', 'pill-yellow', stores.googlePlay)}
${ctaButton(ctx, 'appStore', 'pill-pink', stores.appStore)}`
}
