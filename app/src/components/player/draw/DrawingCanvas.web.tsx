import { DrawingDoc, DrawingWriter } from '@shared/drawing/encoding';
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, STROKE_WIDTHS } from '@shared/drawing/palette';
import { floodFill, rasterize } from '@shared/drawing/raster';
import { DrawingRenderer } from '@shared/drawing/render';
import {
  FIT_VIEWPORT,
  pinchViewport,
  screenToDrawing,
  zoomStep,
  type ScreenPoint,
  type Viewport,
} from '@shared/drawing/viewport';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';

import { AppColors, AppSizes } from '@/constants/appTheme';

import type { DrawingCanvasProps } from './drawingTypes';

// Envoi groupé du dessin (plan § 2) : un paquet toutes les 300 ms au plus, et à chaque fin de geste.
const FLUSH_INTERVAL_MS = 300;
// Contact plus large que ce diamètre (pixels CSS) : une paume, pas un doigt (si le navigateur le donne).
const PALM_CONTACT_PX = 44;
// Début d'un trait gardé sur le téléphone : un second doigt arrivé avant ce délai (pincement) l'annule.
const STROKE_HOLD_MS = 100;
// Zoom : le dessin est repeint plus fin (jusqu'à deux fois) quand on zoome, pour rester net.
const MAX_RESOLUTION = 2;
// Fin d'un changement de zoom avant de repeindre plus fin (évite de repeindre pendant le pincement).
const SHARPEN_DELAY_MS = 150;

// Début d'un trait pas encore envoyé (STROKE_HOLD_MS) : ses points logiques à plat.
interface PendingStroke {
  color: number;
  width: number;
  points: number[];
  startedAt: number;
}

type Gesture =
  | { kind: 'idle' }
  // Un doigt : trait (gardé au début), seau (au lever du doigt).
  | { kind: 'draw'; pointerId: number; pending: PendingStroke | null; isBucket: boolean }
  | { kind: 'pinch'; startView: Viewport; startFingers: [ScreenPoint, ScreenPoint] }
  // Après un pincement : on attend que tous les doigts soient levés.
  | { kind: 'ignore' };

// Ce que le canvas garde entre deux rendus : rien de tout cela ne passe par l'état React (un rendu
// React par mouvement de doigt rendrait le trait saccadé).
interface Session {
  writer: DrawingWriter;
  doc: DrawingDoc;
  renderer: DrawingRenderer | null;
  context: CanvasRenderingContext2D | null;
  scale: number;
  view: Viewport;
  resolution: number;
  fingers: Map<number, ScreenPoint>;
  gesture: Gesture;
  last: ScreenPoint | null;
}

// Site des joueurs : surface de dessin du dessinateur (canvas 2D du navigateur, 4:3) dans un cadre fixe.
// Un doigt dessine tout de suite à l'écran ; les points lissés partent par paquets ; le canvas se repeint
// ensuite d'après ces paquets, comme la TV. Deux doigts : pincer pour zoomer et déplacer (plan 5,
// livraison C), affichage seulement : les points envoyés restent ceux du dessin entier. Défilement,
// « tirer pour recharger », zoom du navigateur et appui long sont bloqués sur la surface.
export function DrawingCanvas({ tool, color, width, onChunk, initialChunks, onViewportChange, ref }: DrawingCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Créée au montage, d'après les paquets déjà envoyés (reprise après un rechargement).
  const session = useRef<Session | null>(null);
  // Outil courant lu par les gestionnaires d'événements (posés une seule fois).
  const toolRef = useRef({ tool, color, width, onChunk, initialChunks, onViewportChange });
  useLayoutEffect(() => {
    toolRef.current = { tool, color, width, onChunk, initialChunks, onViewportChange };
  }, [tool, color, width, onChunk, initialChunks, onViewportChange]);
  // Changement de vue demandé par un bouton (posé par l'effet, qui connaît le cadre).
  const setViewRef = useRef<(view: (current: Viewport, frame: { width: number; height: number }) => Viewport) => void>(() => {});

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
    zoomBy: (direction) => setViewRef.current((view, frame) => zoomStep(view, direction, frame)),
    fit: () => setViewRef.current(() => FIT_VIEWPORT),
  }));

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;
    const doc = new DrawingDoc();
    for (const data of toolRef.current.initialChunks ?? []) doc.applyChunk(data);
    const current: Session = {
      writer: new DrawingWriter(doc),
      doc,
      renderer: null,
      context: null,
      scale: 1,
      view: FIT_VIEWPORT,
      resolution: 1,
      fingers: new Map(),
      gesture: { kind: 'idle' },
      last: null,
    };
    session.current = current;
    const frameSize = () => ({ width: frame.clientWidth, height: frame.clientHeight });

    // Taille réelle du canvas = taille affichée × densité de l'écran × finesse du zoom : trait net ; tout
    // est repeint.
    const resize = () => {
      const ratio = (window.devicePixelRatio || 1) * current.resolution;
      canvas.width = Math.round(frame.clientWidth * ratio);
      canvas.height = Math.round((frame.clientWidth * ratio * DRAW_HEIGHT) / DRAW_WIDTH);
      current.context = canvas.getContext('2d');
      current.scale = canvas.width / DRAW_WIDTH;
      current.renderer = current.context && new DrawingRenderer(current.context, current.scale);
      current.renderer?.repaint(current.doc.ops);
    };

    // Vue affichée : le canvas (taille du cadre) agrandi puis décalé dans le cadre, qui le découpe.
    const showView = () => {
      const { width: frameWidth, height: frameHeight } = frameSize();
      const { scale, x, y } = current.view;
      const shiftX = (-x / DRAW_WIDTH) * frameWidth * scale;
      const shiftY = (-y / DRAW_HEIGHT) * frameHeight * scale;
      canvas.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(${scale})`;
    };
    // Après un changement de zoom : plus fin s'il le faut, puis prévenir l'écran (pourcentage, mini-carte).
    let sharpenTimer: ReturnType<typeof setTimeout> | undefined;
    const settleView = () => {
      clearTimeout(sharpenTimer);
      sharpenTimer = setTimeout(() => {
        const resolution = Math.min(MAX_RESOLUTION, Math.max(1, Math.ceil(current.view.scale)));
        if (resolution !== current.resolution) {
          current.resolution = resolution;
          resize();
        }
      }, SHARPEN_DELAY_MS);
      toolRef.current.onViewportChange?.(current.view);
    };
    setViewRef.current = (change) => {
      current.view = change(current.view, frameSize());
      showView();
      settleView();
    };

    resize();
    showView();
    const observer = new ResizeObserver(() => {
      resize();
      showView();
    });
    observer.observe(frame);

    const inFrame = (event: PointerEvent): ScreenPoint => {
      const box = frame.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const toLogical = (point: ScreenPoint) => {
      const logical = screenToDrawing(current.view, point, frameSize());
      return {
        x: Math.max(0, Math.min(DRAW_WIDTH, Math.round(logical.x))),
        y: Math.max(0, Math.min(DRAW_HEIGHT, Math.round(logical.y))),
      };
    };
    const isPalm = (event: PointerEvent) => event.pointerType === 'touch' && Math.max(event.width, event.height) > PALM_CONTACT_PX;

    // Trait tout de suite à l'écran, avant l'envoi (même style que le rendu des paquets).
    const drawLive = (colorIndex: number, widthIndex: number, from: ScreenPoint, to: ScreenPoint) => {
      const context = current.context;
      if (!context) return;
      context.strokeStyle = DRAW_COLORS[colorIndex];
      context.lineWidth = STROKE_WIDTHS[widthIndex] * current.scale;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(from.x * current.scale, from.y * current.scale);
      context.lineTo(to.x * current.scale, to.y * current.scale);
      context.stroke();
    };

    // Début gardé devenu un vrai trait : envoyé au rédacteur des paquets.
    const commit = (pending: PendingStroke) => {
      const [x, y, ...rest] = pending.points;
      current.writer.beginStroke(pending.color, pending.width, x, y);
      for (let index = 0; index < rest.length; index += 2) current.writer.extendStroke(rest[index], rest[index + 1]);
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      if (isPalm(event)) return;
      current.fingers.set(event.pointerId, inFrame(event));
      frame.setPointerCapture(event.pointerId);
      const { gesture } = current;
      if (current.fingers.size === 2 && gesture.kind === 'draw') {
        // Second doigt : pincement. Un début de trait gardé est effacé ; un trait déjà parti s'arrête là.
        if (gesture.pending) current.renderer?.repaint(current.doc.ops);
        else if (!gesture.isBucket) {
          current.writer.endStroke();
          flush();
        }
        const [first, second] = [...current.fingers.values()];
        current.gesture = { kind: 'pinch', startView: current.view, startFingers: [first, second] };
        return;
      }
      if (current.fingers.size > 1 || gesture.kind !== 'idle') return;
      const point = toLogical(inFrame(event));
      const { tool: currentTool, color: colorIndex, width: widthIndex } = toolRef.current;
      if (currentTool === 'bucket') {
        current.gesture = { kind: 'draw', pointerId: event.pointerId, pending: null, isBucket: true };
        current.last = point;
        return;
      }
      const strokeColor = currentTool === 'eraser' ? BACKGROUND_COLOR : colorIndex;
      current.gesture = {
        kind: 'draw',
        pointerId: event.pointerId,
        pending: { color: strokeColor, width: widthIndex, points: [point.x, point.y], startedAt: event.timeStamp },
        isBucket: false,
      };
      current.last = point;
      drawLive(strokeColor, widthIndex, point, point);
    };

    const onMove = (event: PointerEvent) => {
      if (!current.fingers.has(event.pointerId)) return;
      event.preventDefault();
      current.fingers.set(event.pointerId, inFrame(event));
      const { gesture } = current;
      if (gesture.kind === 'pinch') {
        const [first, second] = [...current.fingers.values()];
        if (!first || !second) return;
        current.view = pinchViewport(gesture.startView, gesture.startFingers, [first, second], frameSize());
        showView();
        return;
      }
      if (gesture.kind !== 'draw' || gesture.isBucket || event.pointerId !== gesture.pointerId) return;
      const stroke = gesture.pending ?? null;
      const colorIndex = stroke?.color ?? (toolRef.current.tool === 'eraser' ? BACKGROUND_COLOR : toolRef.current.color);
      const widthIndex = stroke?.width ?? toolRef.current.width;
      // Points intermédiaires regroupés par le navigateur : un trait sans angles (Chrome, Firefox).
      const events = event.getCoalescedEvents?.() ?? [event];
      for (const sample of events.length > 0 ? events : [event]) {
        const point = toLogical(inFrame(sample));
        if (current.last) drawLive(colorIndex, widthIndex, current.last, point);
        current.last = point;
        if (gesture.pending) gesture.pending.points.push(point.x, point.y);
        else current.writer.extendStroke(point.x, point.y);
      }
      if (gesture.pending && event.timeStamp - gesture.pending.startedAt >= STROKE_HOLD_MS) {
        commit(gesture.pending);
        gesture.pending = null;
      }
    };

    const onUp = (event: PointerEvent) => {
      if (!current.fingers.delete(event.pointerId)) return;
      const { gesture } = current;
      if (gesture.kind === 'pinch') {
        current.gesture = current.fingers.size > 0 ? { kind: 'ignore' } : { kind: 'idle' };
        settleView();
        return;
      }
      if (gesture.kind === 'ignore') {
        if (current.fingers.size === 0) current.gesture = { kind: 'idle' };
        return;
      }
      if (gesture.kind !== 'draw' || event.pointerId !== gesture.pointerId) return;
      current.gesture = { kind: 'idle' };
      if (gesture.isBucket) {
        const point = current.last;
        current.last = null;
        if (!point || event.type === 'pointercancel') return;
        const colorIndex = toolRef.current.color;
        const spans = floodFill(rasterize(current.doc.ops), point.x, point.y, colorIndex);
        if (spans) current.writer.fill(colorIndex, spans);
        flush();
        return;
      }
      current.last = null;
      if (gesture.pending) commit(gesture.pending);
      current.writer.endStroke();
      flush();
    };

    // Rien d'autre ne doit se passer sous le doigt : ni défilement, ni zoom du navigateur, ni menu de
    // l'appui long (Safari : événements « gesture » du pincement).
    const block = (event: Event) => event.preventDefault();
    frame.addEventListener('pointerdown', onDown, { passive: false });
    frame.addEventListener('pointermove', onMove, { passive: false });
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);
    frame.addEventListener('touchstart', block, { passive: false });
    frame.addEventListener('touchmove', block, { passive: false });
    frame.addEventListener('contextmenu', block);
    frame.addEventListener('gesturestart', block);
    frame.addEventListener('gesturechange', block);
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
      clearTimeout(sharpenTimer);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      frame.removeEventListener('touchstart', block);
      frame.removeEventListener('touchmove', block);
      frame.removeEventListener('contextmenu', block);
      frame.removeEventListener('gesturestart', block);
      frame.removeEventListener('gesturechange', block);
      root.style.overscrollBehavior = previous.root;
      document.body.style.overscrollBehavior = previous.body;
    };
    // flush ne lit que des références : les gestionnaires sont posés une seule fois.
  }, []);

  return (
    <div
      ref={frameRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${DRAW_WIDTH} / ${DRAW_HEIGHT}`,
        overflow: 'hidden',
        borderRadius: AppSizes.radius / 2,
        background: DRAW_COLORS[BACKGROUND_COLOR],
        boxShadow: `0 0 0 3px ${AppColors.selection}`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          transformOrigin: '0 0',
          background: DRAW_COLORS[BACKGROUND_COLOR],
        }}
      />
    </div>
  );
}
