import { LiveCanvas, type CanvasSnapshot, type LiveStrokeView } from '@shared/drawing/liveCanvas';
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH } from '@shared/drawing/palette';
import type { SvgShape } from '@shared/drawing/svg';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppColors, AppSizes } from '@/constants/appTheme';

import type { DrawingCanvasProps } from './drawingTypes';

// Envoi groupé du dessin (plan § 2) : un paquet toutes les 300 ms au plus, et à chaque fin de geste.
const FLUSH_INTERVAL_MS = 300;
const VIEW_BOX = `0 0 ${DRAW_WIDTH} ${DRAW_HEIGHT}`;

type Chunk = { seq: number; data: string };

// App de l'hôte qui joue (lot C), chargé par DrawingCanvas.tsx : surface de dessin en SVG (react-native-svg),
// 4:3. Même format et mêmes paquets que le canvas du navigateur : la TV ne voit aucune différence. Le doigt
// dessine tout de suite à l'écran (trait en cours), les paquets partent toutes les 300 ms. L'écran
// n'affiche que des états figés (LiveCanvas.snapshot) : un nouvel objet à chaque changement, que le
// compilateur React ne peut pas garder périmé. Un seul doigt dessine.
export function SvgDrawingCanvas({ tool, color, width, onChunk, initialChunks, ref }: DrawingCanvasProps) {
  const [canvas] = useState(() => new LiveCanvas(initialChunks ?? []));
  const [view, setView] = useState<CanvasSnapshot>(() => canvas.snapshot());
  // Outil courant et envoi, lus par les gestionnaires (minuteur, doigt).
  const toolRef = useRef({ tool, color, width, onChunk });
  useLayoutEffect(() => {
    toolRef.current = { tool, color, width, onChunk };
  }, [tool, color, width, onChunk]);

  // Après chaque action : paquets envoyés, puis l'état figé affiché.
  const publish = useRef((chunks: Chunk[]) => {
    for (const chunk of chunks) toolRef.current.onChunk?.(chunk);
    setView(canvas.snapshot());
  });

  useImperativeHandle(ref, () => ({
    undo: () => publish.current(canvas.undo()),
    clear: () => publish.current(canvas.clear()),
  }));

  useEffect(() => {
    const send = publish.current;
    const intervalId = setInterval(() => send(canvas.flush()), FLUSH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [canvas]);

  function onGrant(event: GestureResponderEvent) {
    const point = canvas.toLogical(event.nativeEvent.locationX, event.nativeEvent.locationY);
    const { tool: currentTool, color: colorIndex, width: widthIndex } = toolRef.current;
    if (currentTool === 'bucket') {
      publish.current(canvas.fill(colorIndex, point.x, point.y));
      return;
    }
    canvas.beginStroke(colorIndex, widthIndex, point.x, point.y, currentTool === 'eraser');
    setView(canvas.snapshot());
  }

  function onMove(event: GestureResponderEvent) {
    // Un second doigt : ignoré (un seul doigt dessine).
    if (event.nativeEvent.touches.length > 1) return;
    const point = canvas.toLogical(event.nativeEvent.locationX, event.nativeEvent.locationY);
    canvas.extendStroke(point.x, point.y);
    setView(canvas.snapshot());
  }

  function onEnd() {
    publish.current(canvas.endStroke());
  }

  return (
    <View
      style={styles.surface}
      onLayout={(event) => canvas.setSize(event.nativeEvent.layout.width, event.nativeEvent.layout.height)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Le dessin garde le doigt : aucun autre geste (retour, défilement) ne le reprend.
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}>
      <Svg width="100%" height="100%" viewBox={VIEW_BOX} pointerEvents="none">
        <Rect x={0} y={0} width={DRAW_WIDTH} height={DRAW_HEIGHT} fill={DRAW_COLORS[BACKGROUND_COLOR]} />
        <SentShapes shapes={view.shapes} />
        {view.live && <LiveStroke stroke={view.live} />}
      </Svg>
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
});
