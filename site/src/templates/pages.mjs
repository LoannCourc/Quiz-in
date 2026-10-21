import { homeMain } from './home.mjs'
import { html } from './html.mjs'
import { layout } from './layout.mjs'
import { helpMain, legalMain, soonMain } from './textPages.mjs'

function page(main, options) {
  return (ctx) => layout(ctx, ctx.t.meta[ctx.pageId], main(ctx), options?.(ctx))
}

// Pages produites dans chaque langue ; l'adresse de chacune est dans le fichier de langue (paths).
export const PAGES = [
  { id: 'home', render: page(homeMain, (ctx) => ({ stylesheets: [ctx.gamesCssUrl] })) },
  { id: 'help', render: page(helpMain) },
  { id: 'privacy', render: page(legalMain) },
  { id: 'terms', render: page(legalMain) },
  { id: 'notice', render: page(legalMain) },
  { id: 'soon', render: page(soonMain) },
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
