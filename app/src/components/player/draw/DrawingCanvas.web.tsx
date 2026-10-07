import { DrawingDoc, DrawingWriter } from '@shared/drawing/encoding';
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, STROKE_WIDTHS } from '@shared/drawing/palette';
import { floodFill, rasterize } from '@shared/drawing/raster';
import { DrawingRenderer } from '@shared/drawing/render';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';

import { AppColors, AppSizes } from '@/constants/appTheme';

import type { DrawingCanvasProps } from './drawingTypes';

// Envoi groupé du dessin (plan § 2) : un paquet toutes les 300 ms au plus, et à chaque fin de geste.
const FLUSH_INTERVAL_MS = 300;
// Contact plus large que ce diamètre (pixels CSS) : une paume, pas un doigt (si le navigateur le donne).
const PALM_CONTACT_PX = 44;

// Ce que le canvas garde entre deux rendus : rien de tout cela ne passe par l'état React (un rendu
// React par mouvement de doigt rendrait le trait saccadé).
interface Session {
  writer: DrawingWriter;
  doc: DrawingDoc;
  renderer: DrawingRenderer | null;
  context: CanvasRenderingContext2D | null;
  scale: number;
  pointerId: number | null;
  last: { x: number; y: number } | null;
}

// Site des joueurs : surface de dessin du dessinateur (canvas 2D du navigateur, 4:3). Le doigt dessine
// tout de suite à l'écran ; les points lissés partent par paquets ; le canvas se repeint ensuite d'après
// ces paquets, comme la TV. Défilement, « tirer pour recharger », zoom et appui long sont bloqués sur la
// surface, et un seul doigt dessine à la fois.
export function DrawingCanvas({ tool, color, width, onChunk, initialChunks, ref }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Créée au montage, d'après les paquets déjà envoyés (reprise après un rechargement).
  const session = useRef<Session | null>(null);
  // Outil courant lu par les gestionnaires d'événements (posés une seule fois).
  const toolRef = useRef({ tool, color, width, onChunk, initialChunks });
  useLayoutEffect(() => {
    toolRef.current = { tool, color, width, onChunk, initialChunks };
  }, [tool, color, width, onChunk, initialChunks]);

  function flush(): void {
    const current = session.current;
    if (!current) return;
    for (const chunk of current.writer.flush()) {
      current.doc.applyChunk(chunk.data);
      toolRef.current.onChunk?.(chunk);
    }
    current.renderer?.render(current.doc);
  }

  useImperativeHandle(ref, () => ({
    undo: () => {
      session.current?.writer.undo();
      flush();
    },
    clear: () => {
      session.current?.writer.clear();
      flush();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const doc = new DrawingDoc();
    for (const data of toolRef.current.initialChunks ?? []) doc.applyChunk(data);
    const current: Session = { writer: new DrawingWriter(doc), doc, renderer: null, context: null, scale: 1, pointerId: null, last: null };
    session.current = current;

    // Taille réelle du canvas = taille affichée × densité de l'écran : trait net ; tout est repeint.
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round((canvas.clientWidth * ratio * DRAW_HEIGHT) / DRAW_WIDTH);
      current.context = canvas.getContext('2d');
      current.scale = canvas.width / DRAW_WIDTH;
      current.renderer = current.context && new DrawingRenderer(current.context, current.scale);
      current.renderer?.repaint(current.doc.ops);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const toLogical = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = Math.round(((event.clientX - box.left) / box.width) * DRAW_WIDTH);
      const y = Math.round(((event.clientY - box.top) / box.height) * DRAW_HEIGHT);
      return { x: Math.max(0, Math.min(DRAW_WIDTH, x)), y: Math.max(0, Math.min(DRAW_HEIGHT, y)) };
    };
    const isPalm = (event: PointerEvent) => event.pointerType === 'touch' && Math.max(event.width, event.height) > PALM_CONTACT_PX;

    // Trait tout de suite à l'écran, avant l'envoi (même style que le rendu des paquets).
    const drawLive = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const context = current.context;
      if (!context) return;
      const { color: colorIndex, width: widthIndex, tool: currentTool } = toolRef.current;
      context.strokeStyle = DRAW_COLORS[currentTool === 'eraser' ? BACKGROUND_COLOR : colorIndex];
      context.lineWidth = STROKE_WIDTHS[widthIndex] * current.scale;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(from.x * current.scale, from.y * current.scale);
      context.lineTo(to.x * current.scale, to.y * current.scale);
      context.stroke();
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      if (current.pointerId !== null || !event.isPrimary || isPalm(event)) return;
      const point = toLogical(event);
      const { tool: currentTool, color: colorIndex, width: widthIndex } = toolRef.current;
      if (currentTool === 'bucket') {
        current.writer.endStroke();
        flush();
        const spans = floodFill(rasterize(current.doc.ops), point.x, point.y, colorIndex);
        if (spans) current.writer.fill(colorIndex, spans);
        flush();
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      current.pointerId = event.pointerId;
      current.last = point;
      current.writer.beginStroke(currentTool === 'eraser' ? BACKGROUND_COLOR : colorIndex, widthIndex, point.x, point.y);
      drawLive(point, point);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== current.pointerId) return;
      event.preventDefault();
      // Points intermédiaires regroupés par le navigateur : un trait sans angles (Chrome, Firefox).
      const events = event.getCoalescedEvents?.() ?? [event];
      for (const sample of events.length > 0 ? events : [event]) {
        const point = toLogical(sample);
        if (current.last) drawLive(current.last, point);
        current.last = point;
        current.writer.extendStroke(point.x, point.y);
      }
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== current.pointerId) return;
      current.pointerId = null;
      current.last = null;
      current.writer.endStroke();
      flush();
    };

    // Rien d'autre ne doit se passer sous le doigt : ni défilement, ni zoom, ni menu de l'appui long.
    const block = (event: Event) => event.preventDefault();
    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('touchstart', block, { passive: false });
    canvas.addEventListener('touchmove', block, { passive: false });
    canvas.addEventListener('contextmenu', block);
    const intervalId = setInterval(flush, FLUSH_INTERVAL_MS);

    // Page entière : pas de « tirer pour recharger » ni de rebond pendant le dessin (Chrome Android,
    // Samsung Internet, Safari 16+).
    const root = document.documentElement;
    const previous = { root: root.style.overscrollBehavior, body: document.body.style.overscrollBehavior };
    root.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('touchstart', block);
      canvas.removeEventListener('touchmove', block);
      canvas.removeEventListener('contextmenu', block);
      root.style.overscrollBehavior = previous.root;
      document.body.style.overscrollBehavior = previous.body;
    };
    // flush ne lit que des références : les gestionnaires sont posés une seule fois.
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: `${DRAW_WIDTH} / ${DRAW_HEIGHT}`,
        borderRadius: AppSizes.radius / 2,
        background: DRAW_COLORS[BACKGROUND_COLOR],
        boxShadow: `0 0 0 3px ${AppColors.selection}`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    />
  );
}
