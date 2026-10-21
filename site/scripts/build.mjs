// Construction du site vitrine : pages HTML statiques dans site/dist/, une série par langue.
// Sans dépendance : node scripts/build.mjs (npm run build).
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { MOTIFS } from '../src/templates/motifs.mjs'
import { PAGES, renderNotFound } from '../src/templates/pages.mjs'
import { findMarkers } from './markers.mjs'

const SITE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = join(SITE_DIR, 'dist')
const ASSETS_DIR = join(SITE_DIR, 'src', 'assets')

function readJson(path) {
  return JSON.parse(readFileSync(join(SITE_DIR, path), 'utf8'))
}

export function loadSources() {
  const config = readJson('config.json')
  const dicts = Object.fromEntries(config.languages.map((code) => [code, readJson(`i18n/${code}.json`)]))
  const { games } = readJson('data/games.json')
  return { config, dicts, games }
}

const COLOR = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i

// Erreurs de data/games.json : identifiant, couleurs, motif connu, nom et description dans chaque langue.
export function gameErrors(config, games) {
  return games.flatMap((game, index) => {
    const label = `data/games.json, jeu ${game.id ?? index}`
    const errors = []
    if (!/^[a-z0-9-]+$/.test(game.id ?? '')) errors.push(`${label} : id en minuscules, chiffres et tirets`)
    for (const key of ['background', 'color', 'border']) {
      if ((key !== 'border' || game.border !== undefined) && !COLOR.test(game[key] ?? '')) errors.push(`${label} : couleur ${key} invalide`)
    }
    if (!(game.motif in MOTIFS)) errors.push(`${label} : motif « ${game.motif} » inconnu (src/templates/motifs.mjs)`)
    if (typeof game.visible !== 'boolean') errors.push(`${label} : visible doit valoir true ou false`)
    if (game.requires !== undefined && typeof config[game.requires] !== 'boolean') errors.push(`${label} : requires « ${game.requires} » absent de config.json`)
    for (const code of config.languages) {
      if (!game.name?.[code]) errors.push(`${label} : nom manquant en ${code}`)
      if (!game.description?.[code]) errors.push(`${label} : description manquante en ${code}`)
    }
    return errors
  })
}

// Couleurs des cartes de jeu, tirées des données : une feuille de style plutôt que des attributs style,
// interdits par la politique de sécurité du site.
function gamesCss(games) {
  return games
    .map((game) => `.game-card--${game.id} { background: ${game.background}; color: ${game.color};${game.border ? ` border: 3px solid ${game.border};` : ''} }\n`)
    .join('')
}

function hashOf(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 10)
}

// Fichier de sortie d'une adresse : « / » → index.html, « /en/ » → en/index.html, « /aide » → aide.html
// (Firebase Hosting sert /aide à partir de aide.html avec cleanUrls).
export function fileForPath(path) {
  if (path.endsWith('/')) return `${path.slice(1)}index.html`
  return `${path.slice(1)}.html`
}

// Adresse d'un fichier du dossier assets, suivie de son empreinte : le navigateur recharge le fichier
// dès qu'il change, même s'il est gardé en cache.
function assetUrlFor(name) {
  return `/assets/${name}?v=${hashOf(readFileSync(join(ASSETS_DIR, name)))}`
}

// Clé du choix de langue mémorisé (localStorage, pas un cookie), partagée avec assets/site.js.
const LANG_STORAGE_KEY = 'quizin-site:lang'
const BOT_PATTERN = 'bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless'

// Première visite de l'accueil par défaut : langue du navigateur parmi celles du site (sinon la langue de
// repli), location.replace pour que le bouton retour ne ramène pas sur la page redirigée.
function languageScript(config, dicts) {
  const homes = Object.fromEntries(config.languages.map((code) => [code, dicts[code].paths.home]))
  return `// Généré par scripts/build.mjs.
;(function () {
  var homes = ${JSON.stringify(homes)}
  try {
    if (localStorage.getItem(${JSON.stringify(LANG_STORAGE_KEY)})) return
  } catch (error) {
    return
  }
  if (/${BOT_PATTERN}/i.test(navigator.userAgent)) return
  var preferred = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']
  var target = ${JSON.stringify(config.fallbackLanguage)}
  for (var i = 0; i < preferred.length; i++) {
    var code = String(preferred[i]).toLowerCase().split('-')[0]
    if (homes[code]) {
      target = code
      break
    }
  }
  if (target !== ${JSON.stringify(config.defaultLanguage)}) location.replace(homes[target])
})()
`
}

function sitemapXml(config, dicts) {
  const absolute = (path) => `${config.siteUrl}${path}`
  const urls = PAGES.flatMap((page) =>
    config.languages.map((code) => {
      const alternates = config.languages
        .map((other) => `    <xhtml:link rel="alternate" hreflang="${dicts[other].lang}" href="${absolute(dicts[other].paths[page.id])}"/>`)
        .join('\n')
      return `  <url>\n    <loc>${absolute(dicts[code].paths[page.id])}</loc>\n${alternates}\n  </url>`
    }),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

function robotsTxt(config) {
  return config.indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n'
}

// Rend toutes les pages en mémoire : Map(chemin dans dist → contenu), et les marqueurs restants.
export function renderSite() {
  const { config, dicts, games } = loadSources()
  const errors = gameErrors(config, games)
  if (errors.length > 0) throw new Error(errors.join('\n'))
  const markers = config.languages.flatMap((code) => findMarkers(dicts[code]).map((found) => ({ ...found, file: `i18n/${code}.json` })))
  if (config.indexable && markers.length > 0) {
    throw new Error(`Site indexable avec ${markers.length} marqueur(s) à compléter : lance npm run check pour la liste.`)
  }

  const files = new Map()
  const css = gamesCss(games)
  files.set('assets/games.css', css)
  const langScript = languageScript(config, dicts)
  files.set('assets/lang.js', langScript)
  const base = {
    config,
    dicts,
    games,
    assetUrl: assetUrlFor,
    gamesCssUrl: `/assets/games.css?v=${hashOf(css)}`,
    langScriptUrl: `/assets/lang.js?v=${hashOf(langScript)}`,
  }
  for (const code of config.languages) {
    for (const page of PAGES) {
      const ctx = { ...base, t: dicts[code], pageId: page.id }
      files.set(fileForPath(dicts[code].paths[page.id]), page.render(ctx))
    }
  }
  const defaultCtx = { ...base, t: dicts[config.defaultLanguage], pageId: 'notFound' }
  files.set('404.html', renderNotFound(defaultCtx))
  files.set('robots.txt', robotsTxt(config))
  if (config.indexable) files.set('sitemap.xml', sitemapXml(config, dicts))
  return { config, files, markers }
}

export function build() {
  const { files, markers } = renderSite()
  rmSync(DIST_DIR, { recursive: true, force: true })
  cpSync(ASSETS_DIR, join(DIST_DIR, 'assets'), { recursive: true })
  for (const [path, content] of files) {
    const target = join(DIST_DIR, path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  console.log(`Site construit : ${files.size} fichiers dans site/dist/`)
  if (markers.length > 0) {
    console.warn(`Attention : ${markers.length} marqueur(s) à compléter dans les textes (liste : npm run check).`)
  }
  return { files, markers }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    build()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
