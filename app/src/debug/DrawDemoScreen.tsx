import type { DrawingRecording } from '@shared/drawing/recording';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentType } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { DrawingCanvas } from '@/components/player/draw/DrawingCanvas';
import type { DrawingCanvasHandle, DrawingCanvasProps, DrawTool } from '@/components/player/draw/drawingTypes';
import { DrawingTools } from '@/components/player/draw/DrawingTools';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Couleur et épaisseur au départ : noir, trait moyen.
const INITIAL_COLOR = 1;
const INITIAL_WIDTH = 1;
const KILOBYTE = 1024;

// ?svg=1 : le canvas de l'app (react-native-svg), dans le navigateur, pour essayer ses gestes et son zoom.
function loadSvgCanvas(): ComponentType<DrawingCanvasProps> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargé seulement avec ?svg=1 : la démo ne doit pas charger le module natif au démarrage
  return (require('@/components/player/draw/SvgDrawingCanvas') as typeof import('@/components/player/draw/SvgDrawingCanvas')).SvgDrawingCanvas;
}

// Prototype du dessin (lot 1, développement seulement, route /debug/draw) : surface et outils du
// dessinateur, sans Firebase. Les paquets sont enregistrés avec leur heure ; « Exporter » donne le dessin
// à rejouer sur la TV (banc d'essai). window.__drawRecording : le même enregistrement, pour les outils.
export default function DrawDemoScreen() {
  const { svg } = useLocalSearchParams<{ svg?: string }>();
  const [Canvas] = useState<ComponentType<DrawingCanvasProps>>(() => (svg === '1' ? loadSvgCanvas() : DrawingCanvas));
  const canvas = useRef<DrawingCanvasHandle>(null);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState(INITIAL_COLOR);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const [recording, setRecording] = useState<DrawingRecording>({ version: 1, chunks: [] });
  // Heure du premier paquet : les autres sont datés depuis lui.
  const startedAt = useRef<number | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  function record({ data }: { seq: number; data: string }) {
    const now = Date.now();
    startedAt.current ??= now;
    const origin = startedAt.current;
    setRecording((current) => {
      const next: DrawingRecording = { version: 1, chunks: [...current.chunks, { t: now - origin, data }] };
      (window as unknown as { __drawRecording?: DrawingRecording }).__drawRecording = next;
      return next;
    });
  }

  function restart() {
    setRecording({ version: 1, chunks: [] });
    startedAt.current = null;
    setIsExportOpen(false);
    setCanvasKey((key) => key + 1);
  }

  const totalLength = recording.chunks.reduce((sum, chunk) => sum + chunk.data.length, 0);
  const opCount = recording.chunks.reduce((sum, chunk) => sum + chunk.data.split('|').length, 0);

  return (
    <Screen>
      <Text style={styles.title}>{strings.drawDemo.title}</Text>
      <Text style={textStyles.muted}>{strings.drawDemo.hint}</Text>
      <Canvas key={canvasKey} ref={canvas} tool={tool} color={color} width={width} onChunk={record} />
      <DrawingTools
        tool={tool}
        color={color}
        width={width}
        onTool={setTool}
        onColor={setColor}
        onWidth={setWidth}
        onUndo={() => canvas.current?.undo()}
        onClear={() => canvas.current?.clear()}
      />
      <Text style={styles.stats}>
        {strings.drawDemo.stats(opCount, recording.chunks.length, (totalLength / KILOBYTE).toFixed(1))}
      </Text>
      <BigButton label={strings.drawDemo.export} size="compact" onPress={() => setIsExportOpen(true)} />
      {isExportOpen && (
        <View style={styles.export}>
          <Text style={textStyles.muted}>{strings.drawDemo.exportHint}</Text>
          <TextInput style={styles.exportText} value={JSON.stringify(recording)} multiline editable={false} selectTextOnFocus />
        </View>
      )}
      <BigButton label={strings.drawDemo.restart} variant="secondary" size="compact" onPress={restart} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
  stats: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
    textAlign: 'center',
  },
  export: {
    gap: Spacing.one,
  },
  exportText: {
    height: 160,
    padding: Spacing.two,
    borderRadius: AppSizes.radius / 2,
    backgroundColor: AppColors.surface,
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 11,
  },
});
