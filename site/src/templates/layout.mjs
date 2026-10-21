import { html } from './html.mjs'

// Adresse de la même page dans une autre langue (la 404 renvoie vers l'accueil de la langue).
export function pathIn(dict, pageId) {
  return dict.paths[pageId] ?? dict.paths.home
}

function langSwitch(ctx) {
  const { config, dicts, t, pageId } = ctx
  return html`<div class="lang-switch" role="group" aria-label="${t.common.langLabel}">${config.languages.map((code) => {
    const dict = dicts[code]
    const isCurrent = code === t.lang
    return html`<a href="${pathIn(dict, pageId)}" lang="${dict.lang}" hreflang="${dict.lang}" data-lang="${dict.lang}"${isCurrent ? html` aria-current="true"` : ''}>${dict.label}</a>`
  })}</div>`
}

function header(ctx) {
  const { t } = ctx
  const home = t.paths.home
  return html`<header class="site-header wrap">
<div class="header-bar">
<a class="logo" href="${home}" aria-label="${t.common.homeLabel}">QUIZ'IN</a>
<nav class="nav-desktop" aria-label="${t.common.mainNav}">
<a class="nav-link" href="${home}#jeux">${t.common.navGames}</a>
<a class="nav-link" href="${home}#comment">${t.common.navHow}</a>
<a class="nav-link" href="${t.paths.help}">${t.common.navHelp}</a>
${langSwitch(ctx)}
<a class="pill pill-pink pill-small" href="${home}#telecharger">${t.common.download}</a>
</nav>
<div class="nav-mobile-tools">
${langSwitch(ctx)}
<button class="burger" type="button" aria-label="${t.common.menu}" aria-expanded="false" aria-controls="menu-mobile">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
</button>
</div>
</div>
<nav id="menu-mobile" class="menu-mobile" aria-label="${t.common.mainNav}" hidden>
<a href="${home}#jeux">${t.common.navGames}</a>
<a href="${home}#comment">${t.common.navHow}</a>
<a href="${t.paths.help}">${t.common.navHelp}</a>
<a class="pill pill-pink" href="${home}#telecharger">${t.common.download}</a>
</nav>
</header>`
}

function footer(ctx) {
  const { t, config } = ctx
  return html`<footer class="site-footer wrap">
<div class="footer-brand"><span class="footer-logo">QUIZ'IN</span><span class="footer-tagline">${t.common.tagline}</span></div>
<nav class="footer-links" aria-label="${t.common.footerNav}">
<a href="${t.paths.privacy}">${t.common.privacy}</a>
<a href="${t.paths.terms}">${t.common.terms}</a>
<a href="${t.paths.notice}">${t.common.legal}</a>
<a href="${t.paths.help}">${t.common.navHelp}</a>
<a href="mailto:${config.contactEmail}">${t.common.contact}</a>
</nav>
</footer>`
}

// Accueil de la langue par défaut seulement : script bloquant (avant l'affichage) qui envoie une première
// visite vers la langue du navigateur ; jamais si un choix est mémorisé ni pour un robot (assets/lang.js).
function languageRedirect(ctx) {
  const { t, config, pageId, langScriptUrl } = ctx
  if (pageId !== 'home' || t.lang !== config.defaultLanguage) return ''
  return html`<script src="${langScriptUrl}"></script>
`
}

// Adresse canonique, versions dans les autres langues (hreflang) et aperçu de partage (Open Graph).
// La 404 n'en a pas : elle n'a pas d'adresse propre.
function seo(ctx, meta) {
  const { t, config, dicts, pageId } = ctx
  if (pageId === 'notFound') return ''
  const absolute = (path) => `${config.siteUrl}${path}`
  const url = absolute(t.paths[pageId])
  const image = absolute(`/assets/og-image-${t.lang}.jpg`)
  return html`<link rel="canonical" href="${url}">
${config.languages.map((code) => html`<link rel="alternate" hreflang="${dicts[code].lang}" href="${absolute(dicts[code].paths[pageId])}">
`)}<link rel="alternate" hreflang="x-default" href="${absolute(dicts[config.defaultLanguage].paths[pageId])}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${t.meta.siteName}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t.meta.ogImageAlt}">
<meta property="og:locale" content="${t.locale}">
${config.languages.filter((code) => code !== t.lang).map((code) => html`<meta property="og:locale:alternate" content="${dicts[code].locale}">
`)}<meta name="twitter:card" content="summary_large_image">
`
}

function head(ctx, meta, stylesheets) {
  const { config, assetUrl } = ctx
  return html`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'; object-src 'none'">
${config.indexable ? '' : html`<meta name="robots" content="noindex">
`}${languageRedirect(ctx)}${seo(ctx, meta)}<meta name="theme-color" content="#2d1074">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/bowlby-one-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/nunito-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assetUrl('site.css')}">
${stylesheets.map((url) => html`<link rel="stylesheet" href="${url}">
`)}<script src="${assetUrl('site.js')}" defer></script>`
}

// Page complète : en-tête, contenu principal, pied. meta : { title, description } ; options.stylesheets :
// feuilles de style propres à la page.
export function layout(ctx, meta, main, { stylesheets = [] } = {}) {
  const { t } = ctx
  return `<!doctype html>
<html lang="${t.lang}">
<head>
${head(ctx, meta, stylesheets)}
</head>
<body>
${html`<a class="skip-link" href="#main">${t.common.skipToContent}</a>`}
${header(ctx)}
<main id="main">
${main}
</main>
${footer(ctx)}
</body>
</html>
`
}
