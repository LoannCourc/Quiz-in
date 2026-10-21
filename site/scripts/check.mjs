// Vérifications du site (npm run check) : mêmes clés dans toutes les langues, construction, liens
// internes et ancres valides, liste des marqueurs de texte à compléter.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build, loadSources } from './build.mjs'

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

// Clés présentes d'un côté seulement (et tableaux de longueurs différentes) entre deux langues.
function structureDiff(reference, other, key = '') {
  if (Array.isArray(reference) || Array.isArray(other)) {
    if (!Array.isArray(reference) || !Array.isArray(other)) return [`${key} : tableau d'un côté seulement`]
    if (reference.length !== other.length) return [`${key} : ${reference.length} éléments contre ${other.length}`]
    return reference.flatMap((item, index) => structureDiff(item, other[index], `${key}.${index}`))
  }
  const isObject = (value) => value !== null && typeof value === 'object'
  if (isObject(reference) !== isObject(other)) return [`${key} : type différent`]
  if (!isObject(reference)) return []
  const keys = new Set([...Object.keys(reference), ...Object.keys(other)])
  return [...keys].flatMap((child) => {
    const childKey = key ? `${key}.${child}` : child
    if (!(child in reference)) return [`${childKey} : absente de la langue de référence`]
    if (!(child in other)) return [`${childKey} : manquante`]
    return structureDiff(reference[child], other[child], childKey)
  })
}

// Fichier servi pour une adresse interne, comme Firebase Hosting avec cleanUrls.
function servedFile(path) {
  if (path.endsWith('/')) return join(DIST_DIR, path, 'index.html')
  if (/\.[a-z0-9]+$/i.test(path)) return join(DIST_DIR, path)
  return join(DIST_DIR, `${path}.html`)
}

function linkErrors(files) {
  const errors = []
  for (const [file, content] of files) {
    if (!file.endsWith('.html')) continue
    for (const [, url] of content.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      const [path, anchor] = url.split('?')[0].split('#')
      const target = servedFile(path)
      if (!existsSync(target)) {
        errors.push(`${file} : lien vers ${url} sans page`)
      } else if (anchor && !readFileSync(target, 'utf8').includes(`id="${anchor}"`)) {
        errors.push(`${file} : ancre ${url} introuvable`)
      }
    }
  }
  return errors
}

const { config, dicts } = loadSources()
const reference = dicts[config.defaultLanguage]
const errors = config.languages
  .filter((code) => code !== config.defaultLanguage)
  .flatMap((code) => structureDiff(reference, dicts[code]).map((message) => `i18n/${code}.json, ${message}`))

let markers = []
try {
  const result = build()
  markers = result.markers
  errors.push(...linkErrors(result.files))
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error))
}

if (markers.length > 0) {
  console.log(`\nMarqueurs à compléter (${markers.length}) :`)
  for (const { file, key, marker } of markers) console.log(`  ${file}  ${key}  ${marker}`)
}
if (errors.length > 0) {
  console.error(`\nErreurs (${errors.length}) :`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}
console.log('\nVérifications OK.')
