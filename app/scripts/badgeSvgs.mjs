// Badges : recopie les SVG du pack (assets/badges/Quizin_badges_svg/) dans src/components/badges/badgeSvgSources.ts,
// sans retoucher les dessins. Seuls les identifiants internes (dégradés, découpe) reçoivent le préfixe du
// fichier : sur le web, deux dessins aux identifiants identiques se mélangeraient.
// Usage (dans app/) : node scripts/badgeSvgs.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const PACK = join(import.meta.dirname, '..', 'assets', 'badges', 'Quizin_badges_svg')
const OUT = join(import.meta.dirname, '..', 'src', 'components', 'badges', 'badgeSvgSources.ts')

const TROPHIES = {
  medal: 'palier1_medaille_cyan.svg',
  cup: 'palier2_coupe_rose.svg',
  gold: 'palier3_trophee_or.svg',
  lockedMedal: 'verrouille_medaille.svg',
  lockedCup: 'verrouille_coupe.svg',
}

function withPrefixedIds(svg, prefix) {
  const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((match) => match[1])
  return ids.reduce(
    (text, id) => text.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`),
    svg,
  )
}

const read = (folder, file) => readFileSync(join(PACK, folder, file), 'utf8').trim()

const trophies = Object.fromEntries(Object.entries(TROPHIES).map(([key, file]) => [key, withPrefixedIds(read('trophees', file), key)]))
const emblems = Object.fromEntries(
  readdirSync(join(PACK, 'emblemes'))
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .map((file) => [basename(file, '.svg'), read('emblemes', file)]),
)

const lines = [
  "// Généré par scripts/badgeSvgs.mjs depuis assets/badges/Quizin_badges_svg/ : ne pas modifier à la main.",
  '',
  `export const TROPHY_SVGS = ${JSON.stringify(trophies, null, 2)} as const;`,
  '',
  `export const EMBLEM_SVGS = ${JSON.stringify(emblems, null, 2)} as const;`,
  '',
  'export type TrophyShape = keyof typeof TROPHY_SVGS;',
  'export type EmblemName = keyof typeof EMBLEM_SVGS;',
  '',
]
writeFileSync(OUT, lines.join('\n'))
console.log(`${Object.keys(trophies).length} trophées et ${Object.keys(emblems).length} emblèmes → ${OUT}`)
