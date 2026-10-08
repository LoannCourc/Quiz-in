import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, STROKE_WIDTHS } from '@shared/drawing/palette';
import { svgShapes, type SvgShape } from '@shared/drawing/svg';
import type { DrawingDoc } from '@shared/drawing/encoding';
import { memo, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppColors, AppSizes } from '@/constants/appTheme';

import { CanvasModel } from './canvasModel';
import type { DrawingCanvasProps } from './drawingTypes';

// Envoi groupé du dessin (plan § 2) : un paquet toutes les 300 ms au plus, et à chaque fin de geste.
const FLUSH_INTERVAL_MS = 300;
const VIEW_BOX = `0 0 ${DRAW_WIDTH} ${DRAW_HEIGHT}`;

// App de l'hôte qui joue (lot C) : surface de dessin en SVG (react-native-svg), 4:3. Même format et mêmes
// paquets que le canvas du navigateur (DrawingCanvas.web.tsx) : la TV ne voit aucune différence. Le doigt
// dessine tout de suite à l'écran (trait en cours), les paquets partent toutes les 300 ms, et le dessin
// envoyé est redessiné d'après eux, comme sur la TV. Un seul doigt dessine.
export function DrawingCanvas({ tool, color, width, onChunk, initialChunks, ref }: DrawingCanvasProps) {
  const [model] = useState(() => new CanvasModel(initialChunks ?? []));
  // Numéros qui changent quand le dessin envoyé ou le trait en cours changent : un rendu React chacun.
  const [sentVersion, setSentVersion] = useState(0);
  const [liveVersion, setLiveVersion] = useState(0);
  // Outil courant et envoi, lus par les gestionnaires (minuteur, doigt).
  const toolRef = useRef({ tool, color, width, onChunk });
  useLayoutEffect(() => {
    toolRef.current = { tool, color, width, onChunk };
  }, [tool, color, width, onChunk]);

  const flush = useRef(() => {
    const chunks = model.flush();
    for (const chunk of chunks) toolRef.current.onChunk?.(chunk);
    if (chunks.length > 0) setSentVersion((version) => version + 1);
  });

  useImperativeHandle(ref, () => ({
    undo: () => {
      model.undo();
      flush.current();
    },
    clear: () => {
      model.clear();
      flush.current();
    },
  }));

  useEffect(() => {
    const send = flush.current;
    const intervalId = setInterval(send, FLUSH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  function onGrant(event: GestureResponderEvent) {
    const point = model.toLogical(event.nativeEvent.locationX, event.nativeEvent.locationY);
    const { tool: currentTool, color: colorIndex, width: widthIndex } = toolRef.current;
    if (currentTool === 'bucket') {
      flush.current();
      model.fill(colorIndex, point.x, point.y);
      flush.current();
      return;
    }
    model.beginStroke(currentTool === 'eraser' ? BACKGROUND_COLOR : colorIndex, widthIndex, point.x, point.y);
    setLiveVersion((version) => version + 1);
  }

  function onMove(event: GestureResponderEvent) {
    // Un second doigt : ignoré (un seul doigt dessine).
    if (event.nativeEvent.touches.length > 1) return;
    const point = model.toLogical(event.nativeEvent.locationX, event.nativeEvent.locationY);
    if (model.extendStroke(point.x, point.y)) setLiveVersion((version) => version + 1);
  }

  function onEnd() {
    if (!model.endStroke()) return;
    flush.current();
    setLiveVersion((version) => version + 1);
  }

  const live = model.live;
  const liveColor = DRAW_COLORS[tool === 'eraser' ? BACKGROUND_COLOR : color];
  return (
    <View
      style={styles.surface}
      onLayout={(event) => model.setSize(event.nativeEvent.layout.width, event.nativeEvent.layout.height)}
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
        <SentShapes doc={model.doc} version={sentVersion} />
        {live && <LiveStroke points={live} version={liveVersion} color={liveColor} width={STROKE_WIDTHS[width]} />}
      </Svg>
    </View>
  );
}

// Dessin déjà envoyé : refait seulement quand des paquets arrivent (version), pas à chaque mouvement.
const SentShapes = memo(function SentShapes({ doc }: { doc: DrawingDoc; version: number }) {
  return <>{svgShapes(doc.ops).map(renderShape)}</>;
});

function renderShape(shape: SvgShape) {
  if (shape.kind === 'dot') return <Circle key={shape.key} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.color} />;
  if (shape.kind === 'fill') return <Path key={shape.key} d={shape.d} fill={shape.color} />;
  return (
    <Path key={shape.key} d={shape.d} stroke={shape.color} strokeWidth={shape.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
}

// Trait en cours, en ligne brisée (le lissage vient avec l'envoi) ; version : un rendu par mouvement.
function LiveStroke({ points, color, width }: { points: readonly number[]; version: number; color: string; width: number }) {
  if (points.length <= 2) return <Circle cx={points[0]} cy={points[1]} r={width / 2} fill={color} />;
  let d = `M${points[0]} ${points[1]}`;
  for (let index = 2; index < points.length; index += 2) d += `L${points[index]} ${points[index + 1]}`;
  return <Path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
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
