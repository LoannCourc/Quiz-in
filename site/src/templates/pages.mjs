import { homeMain } from './home.mjs'
import { html } from './html.mjs'
import { layout } from './layout.mjs'

function stub(pageId) {
  return (ctx) => {
    const meta = ctx.t.meta[pageId]
    return layout(ctx, meta, html`<section class="page-narrow wrap"><h1 class="page-title">${meta.title}</h1></section>`)
  }
}

// Pages produites dans chaque langue ; l'adresse de chacune est dans le fichier de langue (paths).
function home(ctx) {
  return layout(ctx, ctx.t.meta.home, homeMain(ctx), { stylesheets: [ctx.gamesCssUrl] })
}

export const PAGES = [
  { id: 'home', render: home },
  { id: 'help', render: stub('help') },
  { id: 'privacy', render: stub('privacy') },
  { id: 'terms', render: stub('terms') },
  { id: 'notice', render: stub('notice') },
  { id: 'soon', render: stub('soon') },
]

// Une seule page 404 (Firebase n'en sert qu'une) : un bloc par langue, la langue par défaut d'abord.
export function renderNotFound(ctx) {
  const { config, dicts } = ctx
  const blocks = config.languages.map((code) => {
    const { notFound, paths, lang } = dicts[code]
    return html`<div class="not-found-block" lang="${lang}">
<h${code === config.defaultLanguage ? '1' : '2'} class="page-title">${notFound.title}</h${code === config.defaultLanguage ? '1' : '2'}>
<p class="lead">${notFound.text}</p>
<a class="pill pill-yellow" href="${paths.home}">${notFound.back}</a>
</div>`
  })
  const meta = { title: config.languages.map((code) => dicts[code].notFound.title).join(' · '), description: dicts[config.defaultLanguage].notFound.text }
  return layout(ctx, meta, html`<section class="page-narrow wrap not-found">${blocks}</section>`)
}
