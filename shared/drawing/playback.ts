import { DrawingDoc, type DrawOp } from './encoding'
import type { DrawingView } from './render'

// Rejeu lissé du dessin sur la TV (Dessine-moi). Le téléphone envoie un paquet toutes les ~300 ms : peint
// d'un coup, le trait avance par à-coups. La TV affiche donc chaque paquet avec un petit retard fixe
// (DRAW_PLAYBACK_DELAY_MS après son arrivée), et étale ses nouveaux points sur l'intervalle jusqu'au
// paquet suivant (le format n'a pas d'horodatage par point). Jamais de retard cumulé : chaque paquet est
// calé sur SON heure d'arrivée ; si le suivant est dû avant la fin de l'étalement (réseau irrégulier,
// onglet en arrière-plan), le précédent est montré en entier aussitôt (rattrapage).

// Retard d'affichage (ms) : plus grand = plus fluide, mais le dessin arrive plus tard aux devineurs.
export const DRAW_PLAYBACK_DELAY_MS = 500
// Intervalle supposé jusqu'au paquet suivant, s'il n'est pas encore arrivé : moyenne des derniers écarts,
// bornée (un long silence n'étale pas le paquet sur des secondes).
const DEFAULT_SPREAD_MS = 300
const MIN_SPREAD_MS = 120
const MAX_SPREAD_MS = 600
// Poids de la moyenne glissante des écarts entre paquets.
const GAP_SMOOTHING = 0.3

// Pointe du crayon : trait en cours d'étalement, points déjà posés (shown), et avancée (0 à 1) vers le
// point suivant. Peinte à part par la TV (calque effacé à chaque image), pour un trait qui avance en continu.
export interface PenTip {
  op: Extract<DrawOp, { kind: 'stroke' }>
  shown: number
  fraction: number
}

interface Pending {
  data: string
  arrivedAt: number
}

// Croissance d'une opération apportée par un paquet : points d'un trait, ou opération entière (poids 1).
interface Growth {
  index: number
  from: number
  to: number
  weight: number
}

interface Reveal {
  startAt: number
  spreadMs: number
  growths: Growth[]
  total: number
}

export interface PlaybackStats {
  // Paquets reçus en direct, écart d'arrivée moyen et maximal (ms).
  arrivals: number
  gapAverageMs: number
  gapMaxMs: number
  // Moyennes par paquet : points de trait ajoutés, taille (caractères).
  pointsPerChunk: number
  charsPerChunk: number
  // Paquets montrés d'un coup parce que le suivant était déjà dû.
  catchUps: number
}

const lengthOf = (op: DrawOp) => (op.kind === 'stroke' ? op.points.length / 2 : op.kind === 'fill' ? op.spans.length : 0)
const sequenceOf = (data: string) => data.slice(0, data.indexOf(':'))

export class DrawingPlayback {
  readonly doc = new DrawingDoc()
  readonly delayMs: number
  private queue: Pending[] = []
  private seen = new Set<string>()
  private reveal: Reveal | null = null
  private lastArrival: number | null = null
  private gapAverage = DEFAULT_SPREAD_MS
  private appliedLive = 0
  private pointsTotal = 0
  private charsTotal = 0
  readonly stats: PlaybackStats = { arrivals: 0, gapAverageMs: 0, gapMaxMs: 0, pointsPerChunk: 0, charsPerChunk: 0, catchUps: 0 }

  constructor(delayMs = DRAW_PLAYBACK_DELAY_MS) {
    this.delayMs = delayMs
  }

  // Paquets déjà là à l'ouverture (TV ouverte ou rechargée en cours de manche, écran de la réponse) :
  // appliqués tout de suite, sans étalement.
  loadNow(chunks: readonly string[]): void {
    for (const data of chunks) {
      if (this.markSeen(data)) this.doc.applyChunk(data)
    }
  }

  // Paquet arrivé en direct (un paquet déjà vu est ignoré).
  receive(data: string, now: number): void {
    if (!this.markSeen(data)) return
    if (this.lastArrival !== null) {
      const gap = now - this.lastArrival
      this.gapAverage += (gap - this.gapAverage) * GAP_SMOOTHING
      this.stats.gapMaxMs = Math.max(this.stats.gapMaxMs, gap)
      this.stats.gapAverageMs = Math.round(this.gapAverage)
    }
    this.lastArrival = now
    this.stats.arrivals++
    this.queue.push({ data, arrivedAt: now })
  }

  // Avance jusqu'à now : ce qu'il faut peindre, et s'il reste quelque chose à venir (animation en cours).
  frame(now: number): { view: DrawingView; pen: PenTip | null; isAnimating: boolean } {
    while (this.queue.length > 0 && this.queue[0].arrivedAt + this.delayMs <= now) {
      if (this.reveal && now < this.reveal.startAt + this.reveal.spreadMs) this.stats.catchUps++
      this.apply(this.queue.shift() as Pending)
    }
    const { view, pen } = this.visible(now)
    return { view, pen, isAnimating: this.reveal !== null || this.queue.length > 0 }
  }

  private markSeen(data: string): boolean {
    const seq = sequenceOf(data)
    if (seq === '' || this.seen.has(seq)) return false
    this.seen.add(seq)
    return true
  }

  private apply(pending: Pending): void {
    const before = this.doc.ops.map(lengthOf)
    const revision = this.doc.revision
    this.doc.applyChunk(pending.data)
    const { ops } = this.doc
    this.charsTotal += pending.data.length
    this.appliedLive++
    // Annuler (une opération disparaît) : montré tout de suite, le renderer repeint.
    if (this.doc.revision !== revision || ops.length < before.length) {
      this.reveal = null
      this.updateAverages(0)
      return
    }
    const growths: Growth[] = []
    let points = 0
    ops.forEach((op, index) => {
      const from = index < before.length ? before[index] : 0
      const to = lengthOf(op)
      if (index < before.length && to <= from) return
      const isStroke = op.kind === 'stroke'
      if (isStroke) points += to - from
      growths.push({ index, from, to, weight: isStroke ? Math.max(1, to - from) : 1 })
    })
    this.updateAverages(points)
    const next = this.queue[0]
    const gap = next ? next.arrivedAt - pending.arrivedAt : this.gapAverage
    this.reveal = {
      startAt: pending.arrivedAt + this.delayMs,
      spreadMs: Math.max(MIN_SPREAD_MS, Math.min(MAX_SPREAD_MS, gap)),
      growths,
      total: growths.reduce((sum, growth) => sum + growth.weight, 0),
    }
  }

  private updateAverages(points: number): void {
    this.pointsTotal += points
    this.stats.pointsPerChunk = Math.round((this.pointsTotal / this.appliedLive) * 10) / 10
    this.stats.charsPerChunk = Math.round(this.charsTotal / this.appliedLive)
  }

  // Opérations visibles : tout ce qui précède l'étalement en cours, puis la part déjà « dessinée ».
  private visible(now: number): { view: DrawingView; pen: PenTip | null } {
    const { ops, revision } = this.doc
    const reveal = this.reveal
    const all = { view: this.doc, pen: null }
    if (!reveal) return all
    const progress = (now - reveal.startAt) / reveal.spreadMs
    if (progress >= 1 || reveal.total === 0) {
      this.reveal = null
      return all
    }
    let budget = Math.max(0, progress) * reveal.total
    for (const growth of reveal.growths) {
      if (budget >= growth.weight) {
        budget -= growth.weight
        continue
      }
      const op = ops[growth.index]
      const head = ops.slice(0, growth.index)
      // Seau prolongé (suite c<id>) : sa partie déjà montrée reste (jamais d'opération qui disparaît).
      if (op.kind === 'fill') {
        return { view: { ops: growth.from > 0 ? [...head, { ...op, spans: op.spans.slice(0, growth.from) }] : head, revision }, pen: null }
      }
      if (op.kind !== 'stroke') return { view: { ops: head, revision }, pen: null }
      const shown = growth.from + Math.floor(budget)
      const pen = { op, shown, fraction: budget - Math.floor(budget) }
      if (shown === 0) return { view: { ops: head, revision }, pen }
      return { view: { ops: [...head, { ...op, points: op.points.slice(0, shown * 2) }], revision }, pen }
    }
    return all
  }
}
