import { DrawingDoc, DrawingWriter } from '@shared/drawing/encoding';
import { DRAW_HEIGHT, DRAW_WIDTH } from '@shared/drawing/palette';
import { floodFill, rasterize } from '@shared/drawing/raster';

// État du canvas de l'app (DrawingCanvas.tsx), hors de React : le dessin envoyé, l'écriture des paquets et
// le trait en cours. Un rendu React n'est demandé qu'après un changement (numéros de version du composant).
export class CanvasModel {
  readonly doc = new DrawingDoc();
  private readonly writer: DrawingWriter;
  private size = { width: 1, height: 1 };
  // Trait en cours, affiché avant l'envoi, en points logiques à plat.
  private livePoints: number[] | null = null;

  constructor(initialChunks: readonly string[]) {
    for (const data of initialChunks) this.doc.applyChunk(data);
    this.writer = new DrawingWriter(this.doc);
  }

  get live(): readonly number[] | null {
    return this.livePoints;
  }

  setSize(width: number, height: number): void {
    this.size = { width: Math.max(1, width), height: Math.max(1, height) };
  }

  // Position du doigt dans la vue → point logique (640 × 480), bornée au dessin.
  toLogical(x: number, y: number): { x: number; y: number } {
    const logicalX = Math.round((x / this.size.width) * DRAW_WIDTH);
    const logicalY = Math.round((y / this.size.height) * DRAW_HEIGHT);
    return { x: Math.max(0, Math.min(DRAW_WIDTH, logicalX)), y: Math.max(0, Math.min(DRAW_HEIGHT, logicalY)) };
  }

  beginStroke(color: number, width: number, x: number, y: number): void {
    this.writer.beginStroke(color, width, x, y);
    this.livePoints = [x, y];
  }

  extendStroke(x: number, y: number): boolean {
    if (!this.livePoints) return false;
    this.livePoints.push(x, y);
    this.writer.extendStroke(x, y);
    return true;
  }

  endStroke(): boolean {
    if (!this.livePoints) return false;
    this.livePoints = null;
    this.writer.endStroke();
    return true;
  }

  // Seau : la zone du dessin envoyé (même grille que le navigateur et la TV).
  fill(color: number, x: number, y: number): void {
    this.writer.endStroke();
    const spans = floodFill(rasterize(this.doc.ops), x, y, color);
    if (spans) this.writer.fill(color, spans);
  }

  undo(): void {
    this.writer.undo();
  }

  clear(): void {
    this.writer.clear();
  }

  // Paquets prêts à envoyer, appliqués aussi au dessin affiché.
  flush(): { seq: number; data: string }[] {
    const chunks = this.writer.flush();
    for (const chunk of chunks) this.doc.applyChunk(chunk.data);
    return chunks;
  }
}
