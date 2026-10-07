import { drawingChunkList } from '@shared/drawGame';
import type { DrawTurn, PublicSession } from '@shared/types';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DrawingCanvas } from '@/components/player/draw/DrawingCanvas';
import type { DrawingCanvasHandle, DrawTool } from '@/components/player/draw/drawingTypes';
import { DrawingTools } from '@/components/player/draw/DrawingTools';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { PlayerDraw } from '@/lib/playerDraw';

import type { PhaseTiming } from './phaseTiming';
import { Timebar } from './Timebar';

const texts = strings.draw;
// Au départ : noir, trait moyen.
const INITIAL_COLOR = 1;
const INITIAL_WIDTH = 1;

// Dessinateur, en haut de l'écran (petit) : son mot, la catégorie, et le temps restant.
export function DrawerTopBar({ word, category, timing }: { word: string | null; category: string; timing: PhaseTiming }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.wordRow}>
        <Text style={styles.wordLabel}>{texts.yourWord}</Text>
        <Text style={styles.word} numberOfLines={1}>
          {word ?? texts.wordLoading}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
      </View>
      <Timebar {...timing} />
    </View>
  );
}

// Dessinateur (site des joueurs) : le canvas 4:3 sur toute la largeur, les outils en deux lignes dessous.
// La page ne défile pas (Screen sans défilement) ; le canvas bloque défilement, zoom et paume.
export function DrawerView({ session, draw }: { session: PublicSession; draw: PlayerDraw }) {
  const canvas = useRef<DrawingCanvasHandle>(null);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState(INITIAL_COLOR);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  // Dessin déjà envoyé dans cette manche (page rechargée) : lu une fois, à l'arrivée sur l'écran.
  const [initialChunks] = useState(() => drawingChunkList(session.drawing));
  return (
    <View style={styles.drawer}>
      <View style={styles.fullWidth}>
        <DrawingCanvas ref={canvas} tool={tool} color={color} width={width} onChunk={draw.onChunk} initialChunks={initialChunks} />
      </View>
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
      <Text style={[textStyles.muted, styles.centered]}>{texts.noLetters}</Text>
    </View>
  );
}

// Les autres joueurs (et l'hôte qui joue) : qui dessine, l'indice ; le dessin est sur la TV. Lot 2 : pas
// encore de réponse à taper (lot 3).
export function DrawWatchView({ turn, drawerName }: { turn: DrawTurn; drawerName: string }) {
  return (
    <View style={styles.block}>
      <Text style={[textStyles.hero, styles.centered]}>{texts.drawing(drawerName)}</Text>
      <Text style={[textStyles.label, styles.centered]}>{texts.watchTv}</Text>
      <Text style={styles.hint}>{texts.hint(turn.category, turn.wordLength)}</Text>
    </View>
  );
}

// Révélation : le mot, et qui l'a dessiné.
export function DrawRevealView({ word, drawerName }: { word: string; drawerName: string | null }) {
  return (
    <View style={styles.block}>
      <Text style={[textStyles.label, styles.centered]}>{texts.itWas}</Text>
      <Text style={styles.revealWord}>{word}</Text>
      {drawerName && <Text style={[textStyles.muted, styles.centered]}>{texts.drawnBy(drawerName)}</Text>}
    </View>
  );
}

const REVEAL_WORD_SIZE = 40;

const styles = StyleSheet.create({
  topBar: {
    gap: Spacing.one,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  wordLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  word: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 20,
    textTransform: 'uppercase',
  },
  category: {
    ...TEXT_FIT_SAFETY,
    marginLeft: 'auto',
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  drawer: {
    gap: Spacing.two,
  },
  // Le canvas déborde les marges de la colonne : 4:3 sur toute la largeur du téléphone.
  fullWidth: {
    marginHorizontal: -Spacing.three,
  },
  block: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  centered: {
    textAlign: 'center',
  },
  hint: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 18,
    textAlign: 'center',
  },
  revealWord: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: REVEAL_WORD_SIZE,
    lineHeight: Math.round(REVEAL_WORD_SIZE * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
