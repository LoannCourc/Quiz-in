import { DRAW_GUESS_MAX_LENGTH, DRAW_MAX_GUESSES } from '@shared/constants';
import { drawingChunkList } from '@shared/drawGame';
import type { DrawTurn, PlayerResult, PublicSession } from '@shared/types';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DrawingCanvas } from '@/components/player/draw/DrawingCanvas';
import { EyeIcon } from '@/components/player/draw/EyeIcon';
import type { DrawingCanvasHandle, DrawTool } from '@/components/player/draw/drawingTypes';
import { DrawingTools } from '@/components/player/draw/DrawingTools';
import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
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

// Taille du mot : la plus grande qui tient sur une ligne entre les deux cases de l'œil (Bowlby One, une
// lettre majuscule fait environ 0,85 de la taille de police), entre WORD_MIN_SIZE et WORD_MAX_SIZE.
const WORD_MAX_SIZE = 34;
const WORD_MIN_SIZE = 20;
const LETTER_WIDTH_RATIO = 0.85;
const EYE_BOX = 44;
const EYE_SIZE = 26;

function wordFontSize(word: string, screenWidth: number): number {
  const available = Math.min(screenWidth, AppSizes.contentMaxWidth) - 2 * Spacing.three - 2 * EYE_BOX;
  const fitting = Math.floor(available / (Math.max(word.length, 1) * LETTER_WIDTH_RATIO));
  return Math.max(WORD_MIN_SIZE, Math.min(WORD_MAX_SIZE, fitting));
}

// Dessinateur, en haut de l'écran : son mot en grand (masquable d'un tap sur l'œil, si quelqu'un regarde
// par-dessus son épaule), la catégorie en petit, et le temps restant. À monter avec une clé par manche :
// le mot se réaffiche à chaque nouvelle manche.
export function DrawerTopBar({ word, category, timing }: { word: string | null; category: string; timing: PhaseTiming }) {
  const [isHidden, setIsHidden] = useState(false);
  const { width } = useWindowDimensions();
  const shown = word === null ? texts.wordLoading : isHidden ? texts.wordMask : word;
  const size = wordFontSize(word ?? '', width);
  return (
    <View style={styles.topBar}>
      <View style={styles.wordRow}>
        {/* Case vide de la largeur de l'œil, à gauche : le mot reste centré. */}
        <View style={styles.eyeBox} />
        <Text style={[styles.word, { fontSize: size, lineHeight: Math.round(size * DISPLAY_LINE_HEIGHT) }]}>{shown}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isHidden ? texts.showWord : texts.hideWord}
          hitSlop={Spacing.two}
          onPress={() => setIsHidden(!isHidden)}
          style={({ pressed }) => [styles.eyeBox, pressed && styles.pressed]}>
          <EyeIcon isOpen={!isHidden} size={EYE_SIZE} color={AppColors.link} />
        </Pressable>
      </View>
      <Text style={styles.category} numberOfLines={1}>
        {category}
      </Text>
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
      {/* Une seule ligne sous les outils : le canvas et le chrono restent visibles sans défiler à 320 px. */}
      <View style={styles.drawerFooter}>
        <Text style={textStyles.muted}>{texts.noLetters}</Text>
        {draw.canChangeWord && (
          <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={draw.onChangeWord}>
            {({ pressed }) => <Text style={[styles.changeWord, pressed && styles.pressed]}>{texts.changeWord}</Text>}
          </Pressable>
        )}
      </View>
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
  // Groupe : équipe qui jouait la manche, pour le joueur d'une autre équipe (null sinon).
  playingTeam: string | null;
}

// Révélation : le mot, qui l'a dessiné, et ce que la manche rapporte au joueur.
export function DrawRevealView({ word, drawerName, result, isDrawer, isCancelled, playingTeam }: DrawRevealViewProps) {
  let outcome: string | null = null;
  if (isCancelled) outcome = texts.cancelled;
  else if (isDrawer) outcome = texts.drawerPoints(result?.points ?? 0);
  else if (result?.correct) outcome = texts.guessPoints(result.points);
  else if (result) outcome = texts.notFound;
  else if (playingTeam) outcome = texts.otherTeamRound(playingTeam);
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
    alignItems: 'center',
  },
  eyeBox: {
    width: EYE_BOX,
    height: EYE_BOX,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  word: {
    flex: 1,
    minWidth: 0,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  category: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  drawerFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: Spacing.three,
  },
  changeWord: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 15,
    textDecorationLine: 'underline',
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
