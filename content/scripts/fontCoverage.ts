// Caractères présents dans les polices affichées (TV, appli, site des joueurs) : lecture de la table cmap des
// fichiers TTF et WOFF2, sans dépendance (WOFF2 : un flux Brotli, que Node sait décompresser). Sert au build du
// contenu : un caractère absent d'une police s'afficherait dans une police de secours (« Ernő » sur la TV).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'

import { contentDir } from './musicCheck'

// Étiquettes des tables connues de WOFF2 (spécification W3C, table « Known Table Tags »), dans l'ordre.
const WOFF2_KNOWN_TAGS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH',
  'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar',
  'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill',
]

function tagAt(data: Buffer, offset: number): string {
  return data.toString('latin1', offset, offset + 4)
}

// Table cmap d'une police TrueType ou OpenType non compressée.
function sfntCmap(data: Buffer): Buffer {
  const numTables = data.readUInt16BE(4)
  for (let index = 0; index < numTables; index++) {
    const record = 12 + index * 16
    if (tagAt(data, record) === 'cmap') return data.subarray(data.readUInt32BE(record + 8), data.readUInt32BE(record + 8) + data.readUInt32BE(record + 12))
  }
  throw new Error('table cmap absente')
}

// Entier WOFF2 « UIntBase128 » : 7 bits par octet, le bit de poids fort indique la suite.
function readBase128(data: Buffer, offset: number): [number, number] {
  let value = 0
  for (let index = 0; index < 5; index++) {
    const byte = data[offset + index]
    value = value * 128 + (byte & 0x7f)
    if ((byte & 0x80) === 0) return [value, offset + index + 1]
  }
  throw new Error('entier UIntBase128 trop long')
}

// Table cmap d'une police WOFF2 : la cmap n'est jamais transformée, elle se lit telle quelle dans le flux
// décompressé, où les tables se suivent dans l'ordre du répertoire.
function woff2Cmap(data: Buffer): Buffer {
  const numTables = data.readUInt16BE(12)
  const compressedLength = data.readUInt32BE(20)
  let offset = 48
  const tables: { tag: string; length: number }[] = []
  for (let index = 0; index < numTables; index++) {
    const flags = data[offset++]
    let tag = WOFF2_KNOWN_TAGS[flags & 0x3f]
    if ((flags & 0x3f) === 63) {
      tag = tagAt(data, offset)
      offset += 4
    }
    const transform = flags >> 6
    let originalLength: number
    ;[originalLength, offset] = readBase128(data, offset)
    const isTransformed = tag === 'glyf' || tag === 'loca' ? transform === 0 : transform !== 0
    let length = originalLength
    if (isTransformed) [length, offset] = readBase128(data, offset)
    tables.push({ tag, length })
  }
  const stream = brotliDecompressSync(data.subarray(offset, offset + compressedLength))
  let position = 0
  for (const table of tables) {
    if (table.tag === 'cmap') return stream.subarray(position, position + table.length)
    position += table.length
  }
  throw new Error('table cmap absente')
}

// Caractères qui ont un glyphe : sous-tables Unicode de format 4 (plan de base) et 12 (tout Unicode).
function cmapCodepoints(cmap: Buffer): Set<number> {
  const codepoints = new Set<number>()
  const numTables = cmap.readUInt16BE(2)
  for (let index = 0; index < numTables; index++) {
    const platform = cmap.readUInt16BE(4 + index * 8)
    const encoding = cmap.readUInt16BE(6 + index * 8)
    const isUnicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10))
    if (!isUnicode) continue
    const sub = cmap.subarray(cmap.readUInt32BE(8 + index * 8))
    const format = sub.readUInt16BE(0)
    if (format === 4) addFormat4(sub, codepoints)
    if (format === 12) addFormat12(sub, codepoints)
  }
  return codepoints
}

function addFormat4(sub: Buffer, codepoints: Set<number>): void {
  const segCount = sub.readUInt16BE(6) / 2
  const ends = 14
  const starts = ends + segCount * 2 + 2
  const deltas = starts + segCount * 2
  const rangeOffsets = deltas + segCount * 2
  for (let segment = 0; segment < segCount; segment++) {
    const end = sub.readUInt16BE(ends + segment * 2)
    const start = sub.readUInt16BE(starts + segment * 2)
    const delta = sub.readInt16BE(deltas + segment * 2)
    const rangeOffset = sub.readUInt16BE(rangeOffsets + segment * 2)
    for (let code = start; code <= end && code !== 0xffff; code++) {
      let glyph: number
      if (rangeOffset === 0) glyph = (code + delta) & 0xffff
      else {
        const glyphIndexAt = rangeOffsets + segment * 2 + rangeOffset + (code - start) * 2
        glyph = sub.readUInt16BE(glyphIndexAt)
        if (glyph !== 0) glyph = (glyph + delta) & 0xffff
      }
      if (glyph !== 0) codepoints.add(code)
    }
  }
}

function addFormat12(sub: Buffer, codepoints: Set<number>): void {
  const groups = sub.readUInt32BE(12)
  for (let group = 0; group < groups; group++) {
    const start = sub.readUInt32BE(16 + group * 12)
    const end = sub.readUInt32BE(20 + group * 12)
    for (let code = start; code <= end; code++) codepoints.add(code)
  }
}

export function fontCodepoints(file: string): Set<number> {
  const data = readFileSync(file)
  const signature = tagAt(data, 0)
  if (signature === 'wOF2') return cmapCodepoints(woff2Cmap(data))
  if (signature === 'wOFF') throw new Error(`${file} : WOFF 1 non lu (utiliser le .woff2)`)
  return cmapCodepoints(sfntCmap(data))
}

// Une police telle qu'un écran l'affiche : l'union de ses fichiers (sous-ensembles latin, latin-ext… de la TV).
export interface DisplayedFont {
  label: string
  files: string[]
}

const repoDir = join(contentDir, '..')

function filesIn(dir: string, pattern: RegExp): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((name) => pattern.test(name)).map((name) => join(dir, name)) : []
}

// Polices des trois affichages : TV (@fontsource, par sous-ensembles), site des joueurs (woff2 servis par le
// site), appli (TTF de @expo-google-fonts). Un dossier absent (dépendances non installées) est signalé.
export function displayedFonts(): DisplayedFont[] {
  const fontsource = join(repoDir, 'receiver/node_modules/@fontsource')
  const google = join(repoDir, 'app/node_modules/@expo-google-fonts')
  const site = join(repoDir, 'app/public/fonts')
  const fonts: DisplayedFont[] = [
    { label: 'TV · Bowlby One', files: filesIn(join(fontsource, 'bowlby-one/files'), /-400-normal\.woff2$/) },
    ...[700, 800, 900].map((weight) => ({ label: `TV · Nunito ${weight}`, files: filesIn(join(fontsource, 'nunito/files'), new RegExp(`-${weight}-normal\\.woff2$`)) })),
    { label: 'Site des joueurs · Bowlby One', files: filesIn(site, /^bowlby-one-400\.woff2$/) },
    ...[700, 800, 900].map((weight) => ({ label: `Site des joueurs · Nunito ${weight}`, files: filesIn(site, new RegExp(`^nunito-${weight}\\.woff2$`)) })),
    { label: 'Appli · Bowlby One', files: filesIn(join(google, 'bowlby-one/400Regular'), /\.ttf$/) },
    { label: 'Appli · Nunito 700', files: filesIn(join(google, 'nunito/700Bold'), /\.ttf$/) },
    { label: 'Appli · Nunito 800', files: filesIn(join(google, 'nunito/800ExtraBold'), /\.ttf$/) },
    { label: 'Appli · Nunito 900', files: filesIn(join(google, 'nunito/900Black'), /\.ttf$/) },
  ]
  return fonts
}

// Caractère à ne pas vérifier : blancs (espace, retour à la ligne, espace insécable), jamais dessinés.
function isBlank(char: string): boolean {
  return /\s/u.test(char)
}

export interface MissingGlyph {
  char: string
  fonts: string[]
}

// Pour chaque caractère du texte absent d'au moins une police : les polices qui ne l'ont pas.
export function missingGlyphs(text: string, fonts: { label: string; codepoints: Set<number> }[]): MissingGlyph[] {
  const missing: MissingGlyph[] = []
  for (const char of new Set(text)) {
    if (isBlank(char)) continue
    const code = char.codePointAt(0)!
    const lacking = fonts.filter((font) => !font.codepoints.has(code)).map((font) => font.label)
    if (lacking.length > 0) missing.push({ char, fonts: lacking })
  }
  return missing
}

// Champs d'un quiz affichés à l'écran (TV, téléphones) : titre, thème, description, énoncé, propositions,
// réponse attendue, explication, Bluff (vraie réponse, leurres), orthographe affichée d'un morceau. Les
// identifiants, alias et champs Deezer (music.artist, music.title) ne sont jamais affichés tels quels.
const DISPLAYED_KEYS = new Set(['title', 'theme', 'description', 'text', 'options', 'acceptedAnswers', 'explanation', 'answer', 'decoys', 'displayTitle', 'displayArtist'])

export interface DisplayedText {
  // « id-de-question » ou « quiz » pour les champs du quiz lui-même.
  where: string
  text: string
}

export function displayedTexts(quiz: { questions?: unknown[] } & Record<string, unknown>): DisplayedText[] {
  const texts: DisplayedText[] = []
  const collect = (value: unknown, where: string) => {
    if (typeof value === 'string') texts.push({ where, text: value })
    else if (Array.isArray(value)) value.forEach((item) => collect(item, where))
  }
  for (const [key, value] of Object.entries(quiz)) if (DISPLAYED_KEYS.has(key)) collect(value, 'quiz')
  for (const question of quiz.questions ?? []) {
    if (typeof question !== 'object' || question === null) continue
    const record = question as Record<string, unknown>
    const where = typeof record.id === 'string' ? record.id : '?'
    for (const [key, value] of Object.entries(record)) if (DISPLAYED_KEYS.has(key)) collect(value, where)
    if (typeof record.music === 'object' && record.music !== null) {
      for (const [key, value] of Object.entries(record.music)) if (DISPLAYED_KEYS.has(key)) collect(value, where)
    }
  }
  return texts
}
