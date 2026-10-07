// Lissage d'un trait avant l'envoi (Ramer-Douglas-Peucker) : on garde les points qui s'écartent de plus de
// tolerance de la ligne droite entre leurs voisins gardés. Points à plat : x0, y0, x1, y1…

export const SIMPLIFY_TOLERANCE = 1.5

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

// Garde toujours le premier et le dernier point. Itératif (pas de récursion profonde sur un long trait).
export function simplifyPoints(points: readonly number[], tolerance = SIMPLIFY_TOLERANCE): number[] {
  const count = points.length / 2
  if (count <= 2) return [...points]
  const keep = new Uint8Array(count)
  keep[0] = 1
  keep[count - 1] = 1
  const stack: [number, number][] = [[0, count - 1]]
  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number]
    let farthest = -1
    let farthestDistance = tolerance
    for (let index = first + 1; index < last; index++) {
      const distance = distanceToSegment(
        points[index * 2], points[index * 2 + 1],
        points[first * 2], points[first * 2 + 1],
        points[last * 2], points[last * 2 + 1],
      )
      if (distance > farthestDistance) {
        farthest = index
        farthestDistance = distance
      }
    }
    if (farthest !== -1) {
      keep[farthest] = 1
      stack.push([first, farthest], [farthest, last])
    }
  }
  const result: number[] = []
  for (let index = 0; index < count; index++) if (keep[index]) result.push(points[index * 2], points[index * 2 + 1])
  return result
}
