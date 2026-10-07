import { isDrawColor, isStrokeWidth } from './palette'
import { simplifyPoints } from './simplify'

// Dessin en texte compact (plan docs/plan-dessine-moi.md, § 2). Le dessinateur envoie des paquets
// « <seq>:<op>|<op>|… » d'au plus MAX_CHUNK_LENGTH caractères ; la TV les rejoue dans l'ordre de seq.
// Nombres en base 36 (signe « - » possible). Opérations :
//   s<id>,<couleur>,<épaisseur>:<x>,<y>;<dx>,<dy>;…   début d'un trait (points suivants en écarts)
//   f<id>,<couleur>:<gy>,<gx>,<n>;<dgy>,<gx>,<n>;…     seau : segments de la grille (gy en écarts)
//   c<id>:…                                          suite du trait ou du seau <id>, même codage
//   u                                                annuler la dernière opération
//   x<id>                                            tout effacer (annulable comme une opération)

export const MAX_CHUNK_LENGTH = 4000
// Segments de seau par opération envoyée : un grand seau est découpé en suites (c<id>).
const SPANS_PER_TOKEN = 250

export type DrawOp =
  | { kind: 'stroke'; id: number; color: number; width: number; points: number[] }
  | { kind: 'fill'; id: number; color: number; spans: number[] }
  | { kind: 'clear'; id: number }

const encode = (value: number) => value.toString(36)

function decodeNumber(text: string): number {
  const value = parseInt(text, 36)
  if (!Number.isFinite(value) || encode(value) !== text) throw new Error(`nombre invalide : ${text}`)
  return value
}

// Points à plat (x0, y0, x1, y1…) : le premier en absolu par rapport à from (ou tel quel), les suivants
// en écarts.
function encodePoints(points: readonly number[], fromX: number, fromY: number): string {
  const parts: string[] = []
  let x = fromX
  let y = fromY
  for (let index = 0; index < points.length; index += 2) {
    parts.push(`${encode(points[index] - x)},${encode(points[index + 1] - y)}`)
    x = points[index]
    y = points[index + 1]
  }
  return parts.join(';')
}

function encodeSpans(spans: readonly number[], fromY: number): string {
  const parts: string[] = []
  let y = fromY
  for (let index = 0; index < spans.length; index += 3) {
    parts.push(`${encode(spans[index] - y)},${encode(spans[index + 1])},${encode(spans[index + 2])}`)
    y = spans[index]
  }
  return parts.join(';')
}

function decodeTriples(payload: string): number[][] {
  return payload === '' ? [] : payload.split(';').map((part) => part.split(',').map(decodeNumber))
}

// Côté dessinateur : transforme les gestes en opérations, puis en paquets. Les points d'un trait en cours
// sont lissés à chaque envoi (on garde le dernier point envoyé comme ancre, pour un trait continu).
export class DrawingWriter {
  private nextId = 0
  private nextSeq = 0
  private tokens: string[] = []
  private stroke: { id: number; color: number; width: number; raw: number[]; sentX: number; sentY: number; started: boolean } | null = null

  beginStroke(color: number, width: number, x: number, y: number): void {
    this.endStroke()
    this.stroke = { id: this.nextId++, color, width, raw: [x, y], sentX: 0, sentY: 0, started: false }
  }

  extendStroke(x: number, y: number): void {
    const stroke = this.stroke
    if (!stroke) return
    const lastX = stroke.raw[stroke.raw.length - 2]
    const lastY = stroke.raw[stroke.raw.length - 1]
    if (x !== lastX || y !== lastY) stroke.raw.push(x, y)
  }

  endStroke(): void {
    this.emitStroke()
    this.stroke = null
  }

  fill(color: number, spans: readonly number[]): void {
    this.endStroke()
    const id = this.nextId++
    for (let start = 0; start < spans.length; start += SPANS_PER_TOKEN * 3) {
      const part = spans.slice(start, start + SPANS_PER_TOKEN * 3)
      const fromY = start === 0 ? 0 : spans[start - 3]
      this.tokens.push(start === 0 ? `f${encode(id)},${encode(color)}:${encodeSpans(part, fromY)}` : `c${encode(id)}:${encodeSpans(part, fromY)}`)
    }
  }

  undo(): void {
    this.endStroke()
    this.tokens.push('u')
  }

  clear(): void {
    this.endStroke()
    this.tokens.push(`x${encode(this.nextId++)}`)
  }

  // Paquets prêts à envoyer (vide s'il n'y a rien de neuf) : appelé toutes les ~300 ms et à chaque fin
  // de geste. Le trait en cours envoie ses nouveaux points.
  flush(): { seq: number; data: string }[] {
    this.emitStroke()
    const chunks: { seq: number; data: string }[] = []
    let current: string[] = []
    let length = 0
    const close = () => {
      if (current.length === 0) return
      const seq = this.nextSeq++
      chunks.push({ seq, data: `${encode(seq)}:${current.join('|')}` })
      current = []
      length = 0
    }
    for (const token of this.tokens) {
      if (length + token.length + 8 > MAX_CHUNK_LENGTH) close()
      current.push(token)
      length += token.length + 1
    }
    close()
    this.tokens = []
    return chunks
  }

  private emitStroke(): void {
    const stroke = this.stroke
    if (!stroke) return
    if (!stroke.started) {
      const points = simplifyPoints(stroke.raw)
      this.tokens.push(`s${encode(stroke.id)},${encode(stroke.color)},${encode(stroke.width)}:${encodePoints(points, 0, 0)}`)
      stroke.started = true
    } else {
      if (stroke.raw.length <= 2) return
      // Le premier point est l'ancre déjà envoyée.
      const points = simplifyPoints(stroke.raw).slice(2)
      this.tokens.push(`c${encode(stroke.id)}:${encodePoints(points, stroke.sentX, stroke.sentY)}`)
    }
    stroke.sentX = stroke.raw[stroke.raw.length - 2]
    stroke.sentY = stroke.raw[stroke.raw.length - 1]
    stroke.raw = [stroke.sentX, stroke.sentY]
  }
}

// Dessin reconstruit à partir des paquets (TV, et téléphone pour se redessiner). revision change quand
// des opérations disparaissent (annuler) : l'affichage doit alors tout repeindre.
export class DrawingDoc {
  ops: DrawOp[] = []
  revision = 0
  // Volume reçu (caractères) et paquets appliqués : mesures du banc d'essai.
  receivedLength = 0
  appliedChunks = 0
  private nextSeq = 0
  private waiting = new Map<number, string>()
  private cursors = new Map<number, { x: number; y: number }>()

  // Paquet « seq:ops » ; appliqué dès que tous les précédents sont là. Paquet illisible : ignoré.
  applyChunk(data: string): void {
    const separator = data.indexOf(':')
    if (separator <= 0) return
    let seq: number
    try {
      seq = decodeNumber(data.slice(0, separator))
    } catch {
      return
    }
    if (seq < this.nextSeq || this.waiting.has(seq)) return
    this.waiting.set(seq, data.slice(separator + 1))
    this.receivedLength += data.length
    let next = this.waiting.get(this.nextSeq)
    while (next !== undefined) {
      this.waiting.delete(this.nextSeq)
      this.nextSeq++
      this.appliedChunks++
      for (const token of next.split('|')) this.applyToken(token)
      next = this.waiting.get(this.nextSeq)
    }
  }

  private applyToken(token: string): void {
    try {
      const kind = token[0]
      if (kind === 'u') {
        if (this.ops.length === 0) return
        this.ops.pop()
        this.revision++
        return
      }
      if (kind === 'x') {
        this.ops.push({ kind: 'clear', id: decodeNumber(token.slice(1)) })
        return
      }
      const colon = token.indexOf(':')
      const head = token.slice(1, colon).split(',').map(decodeNumber)
      const triples = decodeTriples(token.slice(colon + 1))
      if (kind === 's') this.startStroke(head, triples)
      else if (kind === 'f') this.startFill(head, triples)
      else if (kind === 'c') this.continueOp(head[0], triples)
    } catch {
      // Opération illisible : ignorée (jamais de plantage de l'affichage).
    }
  }

  private startStroke([id, color, width]: number[], triples: number[][]): void {
    if (!isDrawColor(color) || !isStrokeWidth(width) || triples.length === 0) return
    const op: DrawOp = { kind: 'stroke', id, color, width, points: [] }
    this.cursors.set(id, { x: 0, y: 0 })
    this.ops.push(op)
    this.appendPoints(op, triples)
  }

  private startFill([id, color]: number[], triples: number[][]): void {
    if (!isDrawColor(color)) return
    const op: DrawOp = { kind: 'fill', id, color, spans: [] }
    this.cursors.set(id, { x: 0, y: 0 })
    this.ops.push(op)
    this.appendSpans(op, triples)
  }

  // Suite d'une opération encore affichée (une opération annulée entre-temps est ignorée).
  private continueOp(id: number, triples: number[][]): void {
    // Boucle à la main : Array.findLast n'existe pas dans Chrome 92 (box).
    let op: DrawOp | undefined
    for (let index = this.ops.length - 1; index >= 0 && !op; index--) if (this.ops[index].id === id) op = this.ops[index]
    if (op?.kind === 'stroke') this.appendPoints(op, triples)
    else if (op?.kind === 'fill') this.appendSpans(op, triples)
  }

  private appendPoints(op: Extract<DrawOp, { kind: 'stroke' }>, triples: number[][]): void {
    const cursor = this.cursors.get(op.id) ?? { x: 0, y: 0 }
    for (const [dx, dy] of triples) {
      cursor.x += dx
      cursor.y += dy
      op.points.push(cursor.x, cursor.y)
    }
  }

  private appendSpans(op: Extract<DrawOp, { kind: 'fill' }>, triples: number[][]): void {
    const cursor = this.cursors.get(op.id) ?? { x: 0, y: 0 }
    for (const [dy, x, length] of triples) {
      cursor.y += dy
      op.spans.push(cursor.y, x, length)
    }
  }
}
