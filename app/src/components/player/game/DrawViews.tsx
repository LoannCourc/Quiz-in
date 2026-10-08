import { DRAW_GUESS_MAX_LENGTH, DRAW_MAX_GUESSES } from '@shared/constants';
import { drawingChunkList } from '@shared/drawGame';
import { DRAW_HEIGHT, DRAW_WIDTH } from '@shared/drawing/palette';
import type { DrawTurn, PlayerResult, PublicSession } from '@shared/types';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DrawingCanvas } from '@/components/player/draw/DrawingCanvas';
import { EyeIcon } from '@/components/player/draw/EyeIcon';
import type { DrawingCanvasHandle, DrawTool } from '@/components/player/draw/drawingTypes';
import { DrawingColors, DrawingToolButtons, DrawingTools, DrawingWidths, type DrawingToolState } from '@/components/player/draw/DrawingTools';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useDrawerRotation } from '@/hooks/useDrawerRotation';
import type { DrawGuessState, PlayerDraw } from '@/lib/playerDraw';

import { AnswerField } from './FreeQuestionView';
import { useSecondsLeft, type PhaseTiming } from './phaseTiming';

const texts = strings.draw;
// Au départ : noir, trait moyen.
const INITIAL_COLOR = 1;
const INITIAL_WIDTH = 1;

// Taille du mot : la plus grande qui tient sur une ligne entre les deux cases de l'œil (Bowlby One, une
// lettre majuscule fait environ 0,85 de la taille de police), entre WORD_MIN_SIZE et WORD_MAX_SIZE.
const WORD_MAX_SIZE = 34;
const WORD_MIN_SIZE = 16;
const LETTER_WIDTH_RATIO = 0.85;
const EYE_BOX = 44;
const EYE_SIZE = 24;
// « Changer de mot » dans la carte du mot : largeur fixe, réservée pour calculer la taille du mot.
const CHANGE_WORD_WIDTH = 96;
// Paysage (E2) : largeur du panneau de droite (en-tête, mot, couleurs, épaisseurs).
const SIDE_PANEL_WIDTH = 270;

// Taille d'après le mot le plus long (« château de sable » passe à la ligne entre ses mots, jamais au
// milieu d'un mot), dans la largeur disponible.
function wordFontSize(word: string, available: number, maxSize: number): number {
  const longest = Math.max(1, ...word.split(/\s+/).map((part) => [...part].length));
  const fitting = Math.floor(available / (longest * LETTER_WIDTH_RATIO));
  return Math.max(WORD_MIN_SIZE, Math.min(maxSize, fitting));
}

// Vrai si le mot le plus long tient sur une ligne à la taille minimale.
function fitsOnOneLine(word: string, available: number): boolean {
  const longest = Math.max(1, ...word.split(/\s+/).map((part) => [...part].length));
  return longest * LETTER_WIDTH_RATIO * WORD_MIN_SIZE <= available;
}

function contentWidth(screenWidth: number): number {
  return Math.min(screenWidth, AppSizes.contentMaxWidth) - 2 * Spacing.three;
}

export interface DrawerTopBarProps {
  word: string | null;
  // Manche en cours (0 pour la première) et nombre de manches.
  round: number;
  roundCount?: number;
  timing: PhaseTiming;
  // « Changer de mot » : une fois par manche, avant le premier trait.
  canChangeWord: boolean;
  onChangeWord: () => void;
}

// Écran du dessinateur en paysage (maquette E2) : quand la fenêtre est plus large que haute.
export function isDrawerLandscape(width: number, height: number): boolean {
  return width > height;
}

// Dessinateur en portrait, en haut de l'écran (maquette E1) : « MANCHE 3/8 » et « Tu dessines · 1:12 »,
// la carte « TON MOT », puis le rappel « Ni lettres ni chiffres ! ». À monter avec une clé par manche : le
// mot se réaffiche à chaque nouvelle manche.
export function DrawerTopBar(props: DrawerTopBarProps) {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.topBar}>
      <DrawerStatus {...props} />
      <DrawerWordCard {...props} availableWidth={contentWidth(width)} />
      <Text style={styles.noLetters}>{texts.noLetters}</Text>
    </View>
  );
}

function DrawerStatus({ round, roundCount, timing }: DrawerTopBarProps) {
  return (
    <View style={styles.topRow}>
      <View style={styles.roundPill}>
        <Text style={styles.roundText}>{strings.game.roundPill(round, roundCount)}</Text>
      </View>
      <DrawTime key={`${timing.phaseStartedAt}-${timing.phaseEndsAt}`} timing={timing} />
    </View>
  );
}

// Carte « TON MOT » : le mot en grand (ajusté à availableWidth, la largeur de la carte), « Changer de mot »
// et l'œil qui le masque si quelqu'un regarde par-dessus l'épaule du dessinateur.
function DrawerWordCard({ word, canChangeWord, onChangeWord, availableWidth }: DrawerTopBarProps & { availableWidth: number }) {
  const [isHidden, setIsHidden] = useState(false);
  const shown = word === null ? texts.wordLoading : isHidden ? texts.wordMask : word;
  // « Changer de mot » à côté de l'œil si le mot tient encore à la taille minimale, sinon sous le mot.
  const besideEye = 2 * Spacing.three + EYE_BOX + Spacing.two;
  const withButton = besideEye + CHANGE_WORD_WIDTH + Spacing.two;
  const isButtonBeside = canChangeWord && fitsOnOneLine(word ?? '', availableWidth - withButton);
  const size = wordFontSize(word ?? '', availableWidth - (isButtonBeside ? withButton : besideEye), WORD_MAX_SIZE);
  const changeButton = canChangeWord && (
    <Pressable
      accessibilityRole="button"
      hitSlop={Spacing.one}
      onPress={onChangeWord}
      style={({ pressed }) => [styles.changeWord, !isButtonBeside && styles.changeWordBelow, pressed && styles.pressed]}>
      <Text style={styles.changeWordText} numberOfLines={1} maxFontSizeMultiplier={1}>
        {texts.changeWord}
      </Text>
    </Pressable>
  );
  return (
    <View style={styles.wordCard}>
      <View style={styles.wordTexts}>
        <Text style={styles.wordLabel}>{texts.yourWord}</Text>
        <Text style={[styles.word, { fontSize: size, lineHeight: Math.round(size * DISPLAY_LINE_HEIGHT) }]}>{shown}</Text>
        {!isButtonBeside && changeButton}
      </View>
      {isButtonBeside && changeButton}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isHidden ? texts.showWord : texts.hideWord}
        hitSlop={Spacing.one}
        onPress={() => setIsHidden(!isHidden)}
        style={({ pressed }) => [styles.eyeBox, pressed && styles.pressed]}>
        <EyeIcon isOpen={!isHidden} size={EYE_SIZE} color={AppColors.text} />
      </Pressable>
    </View>
  );
}

// « Tu dessines · 1:12 », le temps en vert ; une nouvelle clé à chaque phase (reprise après une pause).
function DrawTime({ timing: timingProp }: { timing: PhaseTiming }) {
  const [timing] = useState<PhaseTiming>(timingProp);
  const seconds = useSecondsLeft(timing);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <Text style={styles.timeText} accessibilityLabel={strings.game.secondsLeft(seconds)}>
      {texts.youDraw}
      <Text style={styles.timeValue}>{clock}</Text>
    </Text>
  );
}

interface DrawerViewProps {
  session: PublicSession;
  draw: PlayerDraw;
  // En-tête du dessinateur : en haut de l'écran en portrait (PlayerGame), dans le panneau de droite en paysage.
  header: DrawerTopBarProps;
}

// Dessinateur : le canvas 4:3, aussi grand que la place restante le permet. Portrait (E1) : les outils
// dessous. Paysage (E2) : les outils en colonne à gauche, l'en-tête, les couleurs et les épaisseurs à
// droite. La page ne défile pas (Screen sans défilement) ; le canvas garde le doigt. Dans l'app, l'écran
// peut tourner tant qu'il est affiché (useDrawerRotation).
export function DrawerView({ session, draw, header }: DrawerViewProps) {
  useDrawerRotation();
  const canvas = useRef<DrawingCanvasHandle>(null);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState(INITIAL_COLOR);
  const [width, setWidth] = useState(INITIAL_WIDTH);
  const window = useWindowDimensions();
  const isLandscape = isDrawerLandscape(window.width, window.height);
  // Place laissée au canvas, mesurée à l'affichage.
  const [area, setArea] = useState({ width: 0, height: 0 });
  // Dessin déjà envoyé dans cette manche (page rechargée) : lu une fois, à l'arrivée sur l'écran.
  const [initialChunks] = useState(() => drawingChunkList(session.drawing));
  const canvasWidth = Math.min(area.width, (area.height * DRAW_WIDTH) / DRAW_HEIGHT);
  const tools: DrawingToolState = {
    tool,
    color,
    width,
    onTool: setTool,
    onColor: setColor,
    onWidth: setWidth,
    onUndo: () => canvas.current?.undo(),
    onClear: () => canvas.current?.clear(),
  };
  const canvasArea = (
    <View style={styles.canvasArea} onLayout={(event) => setArea(event.nativeEvent.layout)}>
      {canvasWidth > 0 && (
        <View style={{ width: canvasWidth }}>
          <DrawingCanvas ref={canvas} tool={tool} color={color} width={width} onChunk={draw.onChunk} initialChunks={initialChunks} />
        </View>
      )}
    </View>
  );
  if (!isLandscape) {
    return (
      <View style={styles.drawer}>
        {canvasArea}
        <DrawingTools {...tools} />
      </View>
    );
  }
  return (
    <View style={styles.drawerLandscape}>
      <DrawingToolButtons {...tools} vertical />
      {canvasArea}
      <View style={styles.sidePanel}>
        <DrawerStatus {...header} />
        <DrawerWordCard {...header} availableWidth={SIDE_PANEL_WIDTH} />
        <DrawingColors {...tools} compact />
        <DrawingWidths {...tools} compact />
        <Text style={styles.noLetters}>{texts.noLetters}</Text>
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
            <Text style={[textStyles.muted, styles.centered]}>{texts.triesLeft(left)}</Text>
            <SubmitButton label={texts.send} onPress={send} disabled={!canSend} />
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
  const { width } = useWindowDimensions();
  const revealSize = wordFontSize(word, contentWidth(width), REVEAL_WORD_SIZE);
  let outcome: string | null = null;
  if (isCancelled) outcome = texts.cancelled;
  else if (isDrawer) outcome = texts.drawerPoints(result?.points ?? 0);
  else if (result?.correct) outcome = texts.guessPoints(result.points);
  else if (result) outcome = texts.notFound;
  else if (playingTeam) outcome = texts.otherTeamRound(playingTeam);
  return (
    <View style={styles.block}>
      <Text style={[textStyles.label, styles.centered]}>{texts.itWas}</Text>
      <Text style={[styles.revealWord, { fontSize: revealSize, lineHeight: Math.round(revealSize * DISPLAY_LINE_HEIGHT) }]}>{word}</Text>
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
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  roundPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.highlight,
  },
  roundText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onHighlight,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  timeText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  timeValue: {
    color: AppColors.correct,
    fontVariant: ['tabular-nums'],
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  wordTexts: {
    flex: 1,
    minWidth: 0,
  },
  wordLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  changeWord: {
    width: CHANGE_WORD_WIDTH,
    paddingVertical: Spacing.one + 2,
    alignItems: 'center',
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  changeWordBelow: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  changeWordText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 11,
  },
  eyeBox: {
    width: EYE_BOX,
    height: EYE_BOX,
    borderRadius: EYE_BOX / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
  },
  noLetters: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  word: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    textTransform: 'uppercase',
  },
  category: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  // Toute la hauteur de l'écran : le canvas prend la place que les outils laissent.
  drawer: {
    flex: 1,
    gap: Spacing.three,
  },
  // Paysage (E2) : outils | canvas | panneau, sur toute la largeur de l'écran.
  drawerLandscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  sidePanel: {
    width: SIDE_PANEL_WIDTH,
    gap: Spacing.two,
  },
  canvasArea: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
