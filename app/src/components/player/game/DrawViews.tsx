import { DRAW_GUESS_MAX_LENGTH, DRAW_MAX_GUESSES } from '@shared/constants';
import { drawingChunkList } from '@shared/drawGame';
import type { DrawTurn, PlayerResult, PublicSession } from '@shared/types';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DrawingCanvas } from '@/components/player/draw/DrawingCanvas';
import type { DrawingCanvasHandle, DrawTool } from '@/components/player/draw/drawingTypes';
import { DrawingTools } from '@/components/player/draw/DrawingTools';
import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { DrawGuessState, PlayerDraw } from '@/lib/playerDraw';

import { AnswerField } from './FreeQuestionView';
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
      {draw.canChangeWord && <BigButton label={texts.changeWord} variant="secondary" size="compact" onPress={draw.onChangeWord} />}
    </View>
  );
}

// Groupe : les joueurs des autres équipes regardent (seule l'équipe du dessinateur devine).
export function DrawSpectatorView({ turn, drawerName, team }: { turn: DrawTurn; drawerName: string; team: string }) {
  return (
    <View style={styles.block}>
      <Text style={[textStyles.hero, styles.centered]}>{texts.drawing(drawerName)}</Text>
      <Text style={styles.hint}>{texts.hint(turn.category, turn.wordLength)}</Text>
      <Text style={[textStyles.label, styles.centered]}>{texts.teamGuesses(team)}</Text>
    </View>
  );
}

interface DrawGuessViewProps {
  turn: DrawTurn;
  drawerName: string;
  draw: PlayerDraw;
}

// Les devineurs (et l'hôte qui joue) : qui dessine, l'indice, un champ pour un mot à la fois. Le dessin
// est sur la TV. L'hôte juge chaque essai ; seul le joueur voit son verdict (« Pas ça… », « Tu es
// proche ! »). Trouvé : plus de champ. Le champ se vide après chaque envoi.
export function DrawGuessView({ turn, drawerName, draw }: DrawGuessViewProps) {
  const { guess } = draw;
  const [text, setText] = useState('');
  const isCooling = useIsBefore(guess.nextAllowedAt);
  const left = DRAW_MAX_GUESSES - guess.used;
  const canSend = !isCooling && !guess.isPending && left > 0 && text.trim() !== '';

  function send() {
    if (!canSend) return;
    draw.onGuess(text);
    setText('');
  }

  if (guess.isFound) {
    return (
      <View style={styles.block}>
        <Text style={[textStyles.hero, styles.centered, styles.found]}>{texts.found}</Text>
        <Text style={[textStyles.label, styles.centered]}>{texts.foundHint}</Text>
      </View>
    );
  }
  return (
    <View style={styles.guess}>
      <Text style={[textStyles.label, styles.centered]}>{texts.drawing(drawerName)}</Text>
      <Text style={styles.hint}>{texts.hint(turn.category, turn.wordLength)}</Text>
      {left > 0 ? (
        <>
          <AnswerField
            label={texts.guessLabel}
            placeholder={texts.guessPlaceholder}
            text={text}
            onChangeText={setText}
            onSubmit={send}
            disabled={false}
            maxLength={DRAW_GUESS_MAX_LENGTH}
            autoFocus
          />
          <GuessFeedback guess={guess} />
          <View style={styles.guessFooter}>
            <BigButton label={texts.send} onPress={send} disabled={!canSend} />
            <Text style={[textStyles.muted, styles.centered]}>{texts.triesLeft(left)}</Text>
          </View>
        </>
      ) : (
        <View style={styles.block}>
          <GuessFeedback guess={guess} />
          <Text style={[textStyles.label, styles.centered]}>{texts.exhausted}</Text>
        </View>
      )}
    </View>
  );
}

// Verdict du dernier essai ; hauteur réservée : le bouton ne saute pas quand le texte change.
function GuessFeedback({ guess }: { guess: DrawGuessState }) {
  const { hint } = guess;
  let content: ReactNode = null;
  if (guess.hasFailed) content = <Text style={[textStyles.error, styles.centered]}>{texts.failed}</Text>;
  else if (guess.isPending) content = <Text style={[textStyles.muted, styles.centered]}>{texts.checking}</Text>;
  else if (hint?.verdict === 'close') content = <Text style={[styles.feedback, styles.close]}>{texts.close(guess.lastText)}</Text>;
  else if (hint?.verdict === 'wrong') content = <Text style={[styles.feedback, styles.wrong]}>{texts.wrong(guess.lastText)}</Text>;
  return <View style={styles.feedbackBox}>{content}</View>;
}

// Vrai tant que l'heure locale n'a pas atteint `until` ; se met à jour tout seul à l'échéance.
function useIsBefore(until: number): boolean {
  const [reached, setReached] = useState(0);
  useEffect(() => {
    const timeoutId = setTimeout(() => setReached(until), Math.max(0, until - Date.now()));
    return () => clearTimeout(timeoutId);
  }, [until]);
  return until > reached;
}

interface DrawRevealViewProps {
  word: string;
  drawerName: string | null;
  // Résultat du joueur : undefined s'il n'a pas joué la manche (autre équipe, arrivé en cours).
  result: PlayerResult | undefined;
  isDrawer: boolean;
  isCancelled: boolean;
}

// Révélation : le mot, qui l'a dessiné, et ce que la manche rapporte au joueur.
export function DrawRevealView({ word, drawerName, result, isDrawer, isCancelled }: DrawRevealViewProps) {
  let outcome: string | null = null;
  if (isCancelled) outcome = texts.cancelled;
  else if (isDrawer) outcome = texts.drawerPoints(result?.points ?? 0);
  else if (result?.correct) outcome = texts.guessPoints(result.points);
  else if (result) outcome = texts.notFound;
  return (
    <View style={styles.block}>
      <Text style={[textStyles.label, styles.centered]}>{texts.itWas}</Text>
      <Text style={styles.revealWord}>{word}</Text>
      {drawerName && <Text style={[textStyles.muted, styles.centered]}>{texts.drawnBy(drawerName)}</Text>}
      {outcome && <Text style={[styles.outcome, result?.correct && !isCancelled && styles.found]}>{outcome}</Text>}
    </View>
  );
}

const REVEAL_WORD_SIZE = 40;
// Deux lignes de verdict : « « parapluie » : tu es proche ! » tient à 320 px.
const FEEDBACK_HEIGHT = 52;

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
  guess: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  guessFooter: {
    marginTop: 'auto',
    gap: Spacing.two,
  },
  feedbackBox: {
    minHeight: FEEDBACK_HEIGHT,
    justifyContent: 'center',
  },
  feedback: {
    fontFamily: AppFonts.black,
    fontSize: 18,
    textAlign: 'center',
  },
  close: {
    color: AppColors.accent,
  },
  wrong: {
    color: AppColors.textMuted,
  },
  found: {
    color: AppColors.correct,
  },
  outcome: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 18,
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
