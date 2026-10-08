import { LiveCanvas, type CanvasSnapshot, type LiveStrokeView } from '@shared/drawing/liveCanvas';
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH } from '@shared/drawing/palette';
import type { SvgShape } from '@shared/drawing/svg';
import { FIT_VIEWPORT, pinchViewport, zoomStep, type ScreenPoint, type Viewport } from '@shared/drawing/viewport';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppColors, AppSizes } from '@/constants/appTheme';

import type { DrawingCanvasProps } from './drawingTypes';

// Envoi groupé du dessin (plan § 2) : un paquet toutes les 300 ms au plus, et à chaque fin de geste.
const FLUSH_INTERVAL_MS = 300;
// Début d'un trait gardé sur le téléphone : un second doigt arrivé avant ce délai (pincement) l'annule.
const STROKE_HOLD_MS = 100;
const FULL_VIEW_BOX = `0 0 ${DRAW_WIDTH} ${DRAW_HEIGHT}`;
// Mini-carte : part de la largeur du dessin ; épaisseur du cadre de la partie visible (points du dessin).
const MINIMAP_SHARE = '28%';
const MINIMAP_FRAME = 14;

type Chunk = { seq: number; data: string };

// Geste en cours (hors de React) : un doigt dessine ou remplit (au lever), deux doigts pincent ; après un
// pincement, on attend que tous les doigts soient levés.
type Gesture =
  | { kind: 'idle' }
  | { kind: 'draw'; startedAt: number; bucketAt: { x: number; y: number } | null }
  | { kind: 'pinch'; startView: Viewport; startFingers: [ScreenPoint, ScreenPoint] }
  | { kind: 'ignore' };

function viewBoxOf({ scale, x, y }: Viewport): string {
  return `${x} ${y} ${DRAW_WIDTH / scale} ${DRAW_HEIGHT / scale}`;
}

// App de l'hôte qui joue (lot C), chargé par DrawingCanvas.tsx : surface de dessin en SVG (react-native-svg),
// 4:3. Même format et mêmes paquets que le canvas du navigateur : la TV ne voit aucune différence. Le doigt
// dessine tout de suite à l'écran (trait en cours), les paquets partent toutes les 300 ms. Deux doigts :
// pincer pour zoomer et déplacer (livraison C) ; le zoom ne change que le viewBox, net à toutes les
// échelles, et les paquets restent en points du dessin entier. L'écran n'affiche que des états figés
// (LiveCanvas.snapshot) : un nouvel objet à chaque changement, que le compilateur React ne peut pas garder
// périmé.
export function SvgDrawingCanvas({ tool, color, width, onChunk, initialChunks, onViewportChange, ref }: DrawingCanvasProps) {
  const [canvas] = useState(() => new LiveCanvas(initialChunks ?? []));
  const [view, setView] = useState<CanvasSnapshot>(() => canvas.snapshot());
  // Outil courant et envoi, lus par les gestionnaires (minuteur, doigts).
  const toolRef = useRef({ tool, color, width, onChunk, onViewportChange });
  useLayoutEffect(() => {
    toolRef.current = { tool, color, width, onChunk, onViewportChange };
  }, [tool, color, width, onChunk, onViewportChange]);
  const gesture = useRef<Gesture>({ kind: 'idle' });
  // Position du cadre dans l'écran, relevée au premier doigt (les doigts suivants arrivent en coordonnées
  // de l'écran).
  const origin = useRef({ x: 0, y: 0 });

  // Après chaque action : paquets envoyés, puis l'état figé affiché.
  const publish = useRef((chunks: Chunk[]) => {
    for (const chunk of chunks) toolRef.current.onChunk?.(chunk);
    setView(canvas.snapshot());
  });
  // Changement de zoom : affiché, puis signalé à l'écran (pourcentage, ligne d'aide).
  const applyView = useRef((next: Viewport, isSettled: boolean) => {
    canvas.setView(next);
    const snapshot = canvas.snapshot();
    setView(snapshot);
    if (isSettled) toolRef.current.onViewportChange?.(snapshot.view);
  });

  useImperativeHandle(ref, () => ({
    undo: () => publish.current(canvas.undo()),
    clear: () => publish.current(canvas.clear()),
    zoomBy: (direction) => applyView.current(zoomStep(canvas.snapshot().view, direction, canvas.frame()), true),
    fit: () => applyView.current(FIT_VIEWPORT, true),
  }));

  useEffect(() => {
    const send = publish.current;
    const intervalId = setInterval(() => send(canvas.flush()), FLUSH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [canvas]);

  function fingersOf(event: GestureResponderEvent): ScreenPoint[] {
    return event.nativeEvent.touches.map((touch) => ({ x: touch.pageX - origin.current.x, y: touch.pageY - origin.current.y }));
  }

  // Deux doigts : un début de trait gardé disparaît ; un trait déjà parti s'arrête là ; le pincement part.
  function startPinch(fingers: ScreenPoint[]) {
    const current = gesture.current;
    if (current.kind === 'draw' && !current.bucketAt) {
      if (canvas.hasPendingStroke) {
        canvas.cancelStroke();
        setView(canvas.snapshot());
      } else {
        publish.current(canvas.endStroke());
      }
    }
    gesture.current = { kind: 'pinch', startView: canvas.snapshot().view, startFingers: [fingers[0], fingers[1]] };
  }

  function onGrant(event: GestureResponderEvent) {
    const { locationX, locationY, pageX, pageY, timestamp } = event.nativeEvent;
    origin.current = { x: pageX - locationX, y: pageY - locationY };
    const fingers = fingersOf(event);
    if (fingers.length >= 2) {
      startPinch(fingers);
      return;
    }
    const point = canvas.toLogical(locationX, locationY);
    const { tool: currentTool, color: colorIndex, width: widthIndex } = toolRef.current;
    if (currentTool === 'bucket') {
      gesture.current = { kind: 'draw', startedAt: timestamp, bucketAt: point };
      return;
    }
    canvas.beginStroke(colorIndex, widthIndex, point.x, point.y, currentTool === 'eraser', true);
    gesture.current = { kind: 'draw', startedAt: timestamp, bucketAt: null };
    setView(canvas.snapshot());
  }

  function onMove(event: GestureResponderEvent) {
    const fingers = fingersOf(event);
    const current = gesture.current;
    if (fingers.length >= 2) {
      if (current.kind === 'draw' || current.kind === 'idle') startPinch(fingers);
      const pinch = gesture.current;
      if (pinch.kind === 'pinch') {
        applyView.current(pinchViewport(pinch.startView, pinch.startFingers, [fingers[0], fingers[1]], canvas.frame()), false);
      }
      return;
    }
    if (current.kind === 'pinch') {
      gesture.current = { kind: 'ignore' };
      toolRef.current.onViewportChange?.(canvas.snapshot().view);
      return;
    }
    if (current.kind !== 'draw' || current.bucketAt || fingers.length === 0) return;
    const point = canvas.toLogical(fingers[0].x, fingers[0].y);
    canvas.extendStroke(point.x, point.y);
    if (canvas.hasPendingStroke && event.nativeEvent.timestamp - current.startedAt >= STROKE_HOLD_MS) canvas.commitStroke();
    setView(canvas.snapshot());
  }

  function onEnd() {
    const current = gesture.current;
    gesture.current = { kind: 'idle' };
    if (current.kind === 'pinch') {
      toolRef.current.onViewportChange?.(canvas.snapshot().view);
      return;
    }
    if (current.kind !== 'draw') return;
    if (current.bucketAt) {
      publish.current(canvas.fill(toolRef.current.color, current.bucketAt.x, current.bucketAt.y));
      return;
    }
    publish.current(canvas.endStroke());
  }

  const isZoomed = view.view.scale > 1;
  return (
    <View
      style={styles.surface}
      onLayout={(event) => canvas.setSize(event.nativeEvent.layout.width, event.nativeEvent.layout.height)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Le dessin garde les doigts : aucun autre geste (retour, défilement) ne les reprend.
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}>
      <Svg width="100%" height="100%" viewBox={viewBoxOf(view.view)} pointerEvents="none">
        <Rect x={0} y={0} width={DRAW_WIDTH} height={DRAW_HEIGHT} fill={DRAW_COLORS[BACKGROUND_COLOR]} />
        <SentShapes shapes={view.shapes} />
        {view.live && <LiveStroke stroke={view.live} />}
      </Svg>
      {isZoomed && <Minimap shapes={view.shapes} view={view.view} />}
    </View>
  );
}

// Dessin déjà envoyé : refait seulement quand la liste des formes change (pas à chaque mouvement).
function SentShapes({ shapes }: { shapes: readonly SvgShape[] }) {
  return <>{shapes.map(renderShape)}</>;
}

function renderShape(shape: SvgShape) {
  if (shape.kind === 'dot') return <Circle key={shape.key} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.color} />;
  if (shape.kind === 'fill') return <Path key={shape.key} d={shape.d} fill={shape.color} />;
  return (
    <Path key={shape.key} d={shape.d} stroke={shape.color} strokeWidth={shape.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
}

// Trait en cours, en ligne brisée (le lissage vient avec l'envoi).
function LiveStroke({ stroke }: { stroke: LiveStrokeView }) {
  if (stroke.dot) return <Circle cx={stroke.dot.cx} cy={stroke.dot.cy} r={stroke.width / 2} fill={stroke.color} />;
  return <Path d={stroke.d} stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

// Mini-carte (maquette E3), pendant un zoom : tout le dessin, et la partie visible encadrée en rose.
function Minimap({ shapes, view }: { shapes: readonly SvgShape[]; view: Viewport }) {
  return (
    <View style={styles.minimap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={FULL_VIEW_BOX}>
        <Rect x={0} y={0} width={DRAW_WIDTH} height={DRAW_HEIGHT} fill={DRAW_COLORS[BACKGROUND_COLOR]} />
        <SentShapes shapes={shapes} />
        <Rect
          x={view.x}
          y={view.y}
          width={DRAW_WIDTH / view.scale}
          height={DRAW_HEIGHT / view.scale}
          stroke={AppColors.zoomViewport}
          strokeWidth={MINIMAP_FRAME}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    width: '100%',
    aspectRatio: DRAW_WIDTH / DRAW_HEIGHT,
    overflow: 'hidden',
    borderRadius: AppSizes.radius / 2,
    borderWidth: 3,
    borderColor: AppColors.selection,
    backgroundColor: DRAW_COLORS[BACKGROUND_COLOR],
  },
  minimap: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: MINIMAP_SHARE,
    aspectRatio: DRAW_WIDTH / DRAW_HEIGHT,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: DRAW_COLORS[BACKGROUND_COLOR],
    boxShadow: `0px 3px 0px ${AppColors.inkSurface}`,
  },
});
