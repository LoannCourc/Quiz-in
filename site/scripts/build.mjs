// Construction du site vitrine : pages HTML statiques dans site/dist/, une série par langue.
// Sans dépendance : node scripts/build.mjs (npm run build).
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
  return { config, dicts }
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
  const hash = createHash('sha256').update(readFileSync(join(ASSETS_DIR, name))).digest('hex').slice(0, 10)
  return `/assets/${name}?v=${hash}`
}

function robotsTxt(config) {
  return config.indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n'
}

// Rend toutes les pages en mémoire : Map(chemin dans dist → contenu), et les marqueurs restants.
export function renderSite() {
  const { config, dicts } = loadSources()
  const markers = config.languages.flatMap((code) => findMarkers(dicts[code]).map((found) => ({ ...found, file: `i18n/${code}.json` })))
  if (config.indexable && markers.length > 0) {
    throw new Error(`Site indexable avec ${markers.length} marqueur(s) à compléter : lance npm run check pour la liste.`)
  }

  const files = new Map()
  for (const code of config.languages) {
    for (const page of PAGES) {
      const ctx = { config, dicts, t: dicts[code], pageId: page.id, assetUrl: assetUrlFor }
      files.set(fileForPath(dicts[code].paths[page.id]), page.render(ctx))
    }
  }
  const defaultCtx = { config, dicts, t: dicts[config.defaultLanguage], pageId: 'notFound', assetUrl: assetUrlFor }
  files.set('404.html', renderNotFound(defaultCtx))
  files.set('robots.txt', robotsTxt(config))
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
