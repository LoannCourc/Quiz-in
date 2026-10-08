import { bluffAttemptsLeft, bluffPlayerOutcome, bluffWriteStatus } from '@shared/bluff';
import { BLUFF_MAX_LENGTH, BLUFF_TRAP_POINTS } from '@shared/constants';
import type { Player, PlayerId, PlayerResult, PublicQuestion, RevealedBluffChoice } from '@shared/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { BUTTON_LABEL_MAX_FONT_SCALE, BUTTON_LABEL_MIN_SCALE } from '@/components/ui/ButtonLabel';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { MarkIcon } from '@/components/ui/MarkIcon';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { PlayerBluff } from '@/lib/playerBluff';

import { AnswerField } from './FreeQuestionView';
import { StreakNotice } from './StreakNotice';


// Bluff (spec 16), téléphone du joueur : écrire sa fausse réponse (B1), attendre et voter (B2),
// résultat (B3). Aucun accès à Firebase : la page fournit l'état (useBluff) et les actions.

// Avatar d'un joueur dans la rangée d'attente : allumé quand il a fini (proposition acceptée, ou vote).
export interface BluffProgressPlayer {
  id: PlayerId;
  avatar: string;
  done: boolean;
}

interface PhaseProps {
  question: PublicQuestion;
  bluff: PlayerBluff;
  progress: BluffProgressPlayer[];
  // Faux quand une TV affiche la partie : l'énoncé se lit sur la TV, le téléphone garde le reste.
  showQuestion: boolean;
}

const { bluff: texts } = strings.game;

// Consigne de la phase (pas une pastille de type de jeu) : ce que le joueur doit faire maintenant.
function Instruction({ label }: { label: string }) {
  return <Text style={styles.instruction}>{label}</Text>;
}

// B1 : pastille de consigne, la question (sur le téléphone seulement sans TV), le champ commun (S1) avec son
// compteur, puis ENVOYER. Après un refus, le texte reste dans le champ pour être modifié.
export function BluffWriteView(props: PhaseProps) {
  const { question, bluff, showQuestion } = props;
  const status = bluffWriteStatus(bluff.entry, bluff.check);
  const [text, setText] = useState(() => (bluff.send.kind !== 'idle' ? bluff.send.text : (bluff.entry?.text ?? '')));

  if (status === 'accepted') {
    return <BluffWaitView {...props} title={texts.sentTitle} quote={bluff.entry?.text} />;
  }
  if (status === 'exhausted') {
    return <BluffWaitView {...props} title={texts.exhaustedTitle} message={texts.exhaustedText} withMark={false} />;
  }

  const isBusy = status === 'checking' || bluff.send.kind === 'sending';
  const canSubmit = !isBusy && text.trim() !== '';
  const verdict = status === 'refused' ? bluff.check?.verdict : undefined;
  function submit() {
    if (canSubmit) bluff.onSubmit(text);
  }

  return (
    <View style={styles.container}>
      <View style={styles.writePill}>
        <Text style={styles.writePillText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={BUTTON_LABEL_MIN_SCALE} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
          {texts.writeInstruction}
        </Text>
      </View>
      {showQuestion && <Text style={styles.questionText}>{question.text}</Text>}
      <AnswerField
        label={texts.fieldLabel}
        placeholder={texts.placeholder}
        text={text}
        onChangeText={setText}
        onSubmit={submit}
        disabled={isBusy}
        maxLength={BLUFF_MAX_LENGTH}
        isRefused={verdict !== undefined && verdict !== 'ok'}
        autoFocus
      />
      {verdict !== undefined && verdict !== 'ok' ? (
        <View style={styles.refusal}>
          <Text style={styles.refusalTitle}>{texts.refusals[verdict]}</Text>
          <Text style={styles.refusalText}>{texts.retry(bluffAttemptsLeft(bluff.check))}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>{texts.hint}</Text>
      )}
      <View style={styles.footer}>
        {status === 'checking' && <Text style={[textStyles.muted, styles.centered]}>{texts.checking}</Text>}
        {bluff.send.kind === 'failed' && <Text style={[textStyles.error, styles.centered]}>{texts.sendFailed}</Text>}
        <SubmitButton label={bluff.send.kind === 'sending' ? texts.sending : texts.send} onPress={submit} disabled={!canSubmit} />
      </View>
    </View>
  );
}

interface WaitProps extends PhaseProps {
  title: string;
  quote?: string;
  message?: string;
  withMark?: boolean;
}

// B2, à gauche : coche, message, rappel de la proposition (ou du vote), et qui a déjà fini.
function BluffWaitView({ progress, title, quote, message, withMark = true }: WaitProps) {
  return (
    <View style={styles.container}>
      <View style={styles.waitCenter}>
        {withMark && <MarkIcon kind="check" size={48} color={AppColors.correct} />}
        <Text style={[textStyles.hero, styles.waitTitle]}>{title}</Text>
        {quote !== undefined && <Text style={styles.waitQuote}>{texts.quoted(quote)}</Text>}
        <Text style={styles.waitMessage}>{message ?? texts.waiting}</Text>
        <ProgressRow progress={progress} />
      </View>
    </View>
  );
}

function ProgressRow({ progress }: { progress: BluffProgressPlayer[] }) {
  return (
    <View style={styles.progress}>
      {progress.map((entry) => (
        <View key={entry.id} style={[styles.progressAvatar, entry.done && styles.progressDone]}>
          <Text style={styles.progressEmoji}>{entry.avatar}</Text>
        </View>
      ))}
    </View>
  );
}

// B2, à droite : les choix (le sien grisé, « Ta proposition »), un appui sélectionne, puis
// « Je vote pour celle-ci ». La liste défile avec la page quand les choix sont nombreux.
export function BluffVoteView(props: PhaseProps) {
  const { question, bluff, progress, showQuestion } = props;
  const choices = question.choices ?? [];
  const { vote, ownChoice } = bluff;
  const [selected, setSelected] = useState<number | null>(vote.kind === 'refused' ? vote.choice : null);

  if (vote.kind === 'sent') {
    const votedText = vote.choice === null ? undefined : choices[vote.choice];
    return <BluffWaitView {...props} title={texts.voteSentTitle} quote={votedText} />;
  }

  const isSending = vote.kind === 'sending';
  return (
    <View style={styles.container}>
      <Instruction label={texts.voteInstruction} />
      {showQuestion && <Text style={styles.questionText}>{question.text}</Text>}
      <View style={styles.choices}>
        {choices.map((choice, choiceIndex) => {
          const isOwn = choiceIndex === ownChoice;
          const isSelected = choiceIndex === selected;
          return (
            <Pressable
              key={choiceIndex}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isOwn || isSending }}
              disabled={isOwn || isSending}
              onPress={() => setSelected(choiceIndex)}
              style={[styles.choice, isSelected && styles.choiceSelected, isOwn && styles.choiceOwn]}>
              <Text style={[styles.choiceLetter, isSelected && styles.onSelected, isOwn && styles.ownText]}>
                {String.fromCharCode(65 + choiceIndex)}
              </Text>
              <Text style={[styles.choiceText, isSelected && styles.onSelected, isOwn && styles.ownText]}>{choice}</Text>
              {isOwn && (
                <View style={styles.ownTag}>
                  <Text style={styles.ownTagText}>{texts.mine}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        {vote.kind === 'refused' && <Text style={[textStyles.error, styles.centered]}>{texts.voteRefusals[vote.reason]}</Text>}
        {selected === null && <Text style={[styles.hint, styles.centered]}>{texts.pickHint}</Text>}
        <ProgressRow progress={progress} />
        <BigButton
          label={isSending ? texts.sending : texts.voteButton}
          onPress={() => selected !== null && bluff.onVote(selected)}
          disabled={selected === null || isSending}
        />
      </View>
    </View>
  );
}

interface BluffRevealViewProps {
  choices: readonly RevealedBluffChoice[];
  result: PlayerResult | undefined;
  uid: PlayerId;
  players: Record<PlayerId, Player>;
  // Série du joueur à montrer (3 et plus, vraie réponse trouvée) : badge flamme et « Série de 4 ! ».
  streak?: number | null;
}

function namesOf(ids: readonly PlayerId[] | undefined, players: Record<PlayerId, Player>): string[] {
  return (ids ?? []).map((id) => players[id]?.name).filter((name): name is string => name !== undefined);
}

// B3 : « Bien vu ! » ou « Piégé ! », les points, la vraie réponse, et qui sa proposition a piégé.
export function BluffRevealView({ choices, result, uid, players, streak }: BluffRevealViewProps) {
  const { voted, own, points } = bluffPlayerOutcome(choices, result, uid);
  const truth = choices.find((choice) => choice.kind === 'truth');
  const isFound = voted?.kind === 'truth';
  const trapped = namesOf(own?.voters, players);
  const title = voted === null ? texts.noVote : isFound ? texts.found : texts.trapped;
  const lines = [
    voted === null
      ? texts.noVoteText
      : isFound
        ? texts.foundText
        : voted.kind === 'decoy'
          ? texts.votedDecoy
          : texts.votedFor(texts.names(namesOf(voted.authors, players))),
    !isFound && trapped.length > 0 ? texts.butTrapped(trapped.length) : '',
  ].filter(Boolean)

  return (
    <View style={styles.container}>
      <Text style={[textStyles.hero, styles.revealTitle, isFound ? styles.found : voted === null ? styles.muted : styles.trappedTitle]}>
        {title}
      </Text>
      <Text style={styles.revealPoints}>{texts.points(points)}</Text>
      {streak != null && <StreakNotice streak={streak} />}
      <Text style={styles.revealText}>{lines.join(' ')}</Text>
      {truth && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{texts.truthLabel}</Text>
          <Text style={styles.truthText}>{truth.text}</Text>
        </View>
      )}
      {own && (
        <View style={styles.card}>
          {trapped.length > 0 ? (
            <Text style={styles.cardText}>
              {texts.ownTrappedStart(own.text)}
              <Text style={styles.trappedNames}>{texts.names(trapped)}</Text>
              {texts.ownTrappedEnd(trapped.length * BLUFF_TRAP_POINTS)}
            </Text>
          ) : (
            <Text style={styles.cardText}>{texts.ownNobody}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const PROGRESS_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  centered: {
    textAlign: 'center',
  },
  writePill: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
  },
  writePillText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  instruction: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 20,
    textAlign: 'center',
  },
  questionText: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 22,
    textAlign: 'center',
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  refusal: {
    gap: 2,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.accent,
  },
  refusalTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  refusalText: {
    color: AppColors.ink,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.two,
  },
  waitCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  waitTitle: {
    textAlign: 'center',
  },
  waitQuote: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 17,
    textAlign: 'center',
  },
  waitMessage: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  progress: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.one + 2,
  },
  progressAvatar: {
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
    borderRadius: PROGRESS_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.card,
    opacity: 0.4,
  },
  progressDone: {
    borderColor: AppColors.correct,
    opacity: 1,
  },
  progressEmoji: {
    fontSize: 18,
  },
  choices: {
    gap: Spacing.two,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.inkSurface,
  },
  choiceSelected: {
    borderColor: AppColors.selection,
    backgroundColor: AppColors.accent,
  },
  choiceOwn: {
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
    backgroundColor: 'transparent',
  },
  choiceLetter: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 18,
    lineHeight: Math.round(18 * DISPLAY_LINE_HEIGHT),
  },
  choiceText: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  onSelected: {
    color: AppColors.ink,
  },
  ownText: {
    color: AppColors.textMuted,
  },
  ownTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  ownTagText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 11,
  },
  revealTitle: {
    textAlign: 'center',
  },
  found: {
    color: AppColors.correct,
  },
  trappedTitle: {
    color: AppColors.wrong,
  },
  muted: {
    color: AppColors.textMuted,
  },
  revealPoints: {
    ...TEXT_FIT_SAFETY,
    alignSelf: 'center',
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 48,
    lineHeight: Math.round(48 * DISPLAY_LINE_HEIGHT),
  },
  revealText: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  cardLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  truthText: {
    color: AppColors.correct,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
  cardText: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  trappedNames: {
    color: AppColors.accent,
  },
});
