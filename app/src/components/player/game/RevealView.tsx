import { StyleSheet, Text, View } from 'react-native';

import { MarkIcon } from '@/components/ui/MarkIcon';
import { textStyles } from '@/components/ui/textStyles';
import { AppCoinGradient, AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { FreeText, RevealOutcome } from '@/lib/playerGame';

import { gradientStyle } from '@/components/ui/gradient';

import { ChoicePill, choiceTextSize } from './ChoicePill';

// Réponse libre (maquette S2) : bonne réponse (titre et artiste pour un blind test « both »), parties
// jugées justes en « both », réponse tapée par le joueur (null si l'appareil ne l'a pas gardée).
export interface FreeRevealInfo {
  title: string;
  artist?: string;
  parts?: { title: boolean; artist: boolean };
  given: FreeText | null;
  // Rapidité activée : les points des parties comprennent le bonus.
  speedBonus: boolean;
}

interface RevealViewProps {
  outcome: RevealOutcome;
  points: number;
  // Part du bonus de rapidité dans les points (option Rapidité), sinon undefined.
  speedBonus?: number;
  correctAnswer: string;
  // Position de la bonne réponse (lettre et couleur) ; undefined si introuvable.
  correctChoice?: number;
  // Propositions de la question : la bonne réponse garde la taille de texte de l'écran de question.
  options?: readonly string[];
  // Absent en Suspense : pas de rang en cours de partie (seulement les points gagnés).
  rank?: number;
  previousRank?: number;
  // Réponse libre : bonne réponse rappelée avec ce que le joueur a écrit, à la place de la pilule.
  free?: FreeRevealInfo;
}

export function RevealView(props: RevealViewProps) {
  const { outcome, points, speedBonus, correctAnswer, correctChoice, options = [], rank, previousRank, free } = props;
  const isCorrect = outcome === 'correct';

  return (
    <View style={styles.container}>
      <Text style={[textStyles.hero, outcome === 'partial' && styles.partialTitle]}>{strings.game.reveal.titles[outcome]}</Text>

      {/* Ton plus doux pour une mauvaise réponse ou une absence de réponse : pièce translucide. */}
      <PointsCoin points={points} isSoft={!isCorrect} />
      {free ? (
        <FreeResult free={free} isCorrect={isCorrect} points={points} />
      ) : (
        <ChoiceResult correctAnswer={correctAnswer} correctChoice={correctChoice} options={options} isCorrect={isCorrect} />
      )}
      {isCorrect && free?.artist === undefined && speedBonus !== undefined && speedBonus > 0 && (
        <Text style={[textStyles.body, styles.centered]}>{strings.game.reveal.speedBonus(speedBonus)}</Text>
      )}

      {rank !== undefined && <PlaceBand rank={rank} previousRank={previousRank} />}
    </View>
  );
}

interface ChoiceResultProps {
  correctAnswer: string;
  correctChoice?: number;
  options: readonly string[];
  isCorrect: boolean;
}

function ChoiceResult({ correctAnswer, correctChoice, options, isCorrect }: ChoiceResultProps) {
  return (
    <>
      {!isCorrect && <Text style={[textStyles.label, styles.centered]}>{strings.game.reveal.correctAnswerLabel}</Text>}
      {correctChoice === undefined ? (
        <Text style={[textStyles.label, styles.centered]}>{correctAnswer}</Text>
      ) : (
        <ChoicePill choice={correctChoice} text={correctAnswer} textSize={choiceTextSize(options)} />
      )}
    </>
  );
}

// Points de chaque partie en « both » : tout pour la seule partie juste, partagés si les deux le sont.
function partPoints(points: number, parts: { title: boolean; artist: boolean }): { title: number; artist: number } {
  if (parts.title && parts.artist) {
    const title = Math.round(points / 2);
    return { title, artist: points - title };
  }
  return { title: parts.title ? points : 0, artist: parts.artist ? points : 0 };
}

// Libellé d'une partie fausse : rappel de ce que le joueur a écrit, s'il a écrit quelque chose.
function partLabel(label: string, isOk: boolean, typed: string): string {
  return !isOk && typed !== '' ? strings.game.reveal.youWrote(label, typed) : label;
}

function FreeResult({ free, isCorrect, points }: { free: FreeRevealInfo; isCorrect: boolean; points: number }) {
  const { reveal } = strings.game;
  const typedTitle = free.given?.value.trim() ?? '';
  if (free.artist === undefined || !free.parts) {
    return <PartRow isOk={isCorrect} label={partLabel(reveal.correctAnswerLabel, isCorrect, typedTitle)} value={free.title} />;
  }
  const typedArtist = free.given?.artist?.trim() ?? '';
  const shares = partPoints(points, free.parts);
  return (
    <View style={styles.parts}>
      <PartRow
        isOk={free.parts.title}
        label={partLabel(reveal.partLabels.title, free.parts.title, typedTitle)}
        value={free.title}
        points={shares.title}
      />
      <PartRow
        isOk={free.parts.artist}
        label={partLabel(reveal.partLabels.artist, free.parts.artist, typedArtist)}
        value={free.artist}
        points={shares.artist}
      />
      {free.speedBonus && <Text style={styles.partsNote}>{reveal.speedIncluded}</Text>}
    </View>
  );
}

interface PartRowProps {
  isOk: boolean;
  label: string;
  value: string;
  points?: number;
}

// Ligne de résultat : pastille coche ou croix (le signe porte l'information, pas seulement la couleur),
// libellé, bonne réponse, et points de la partie en « both ».
function PartRow({ isOk, label, value, points }: PartRowProps) {
  return (
    <View style={styles.partRow}>
      <View style={[styles.partIcon, isOk ? styles.partIconOk : styles.partIconWrong]}>
        <MarkIcon kind={isOk ? 'check' : 'cross'} size={20} color={AppColors.ink} />
      </View>
      <View style={styles.partTexts}>
        <Text style={styles.partLabel}>{label}</Text>
        <Text style={styles.partValue}>{value}</Text>
      </View>
      {points !== undefined && (
        <Text style={[styles.partPoints, points > 0 && styles.partPointsWon]}>{strings.game.reveal.partPoints(points)}</Text>
      )}
    </View>
  );
}

function PointsCoin({ points, isSoft }: { points: number; isSoft: boolean }) {
  return (
    <View style={[styles.coin, isSoft ? styles.softCoin : COIN_GRADIENT]}>
      <Text style={[styles.coinPoints, isSoft && styles.softCoinText]}>{strings.game.reveal.coinPoints(points)}</Text>
      <Text style={[styles.coinLabel, isSoft && styles.softCoinText]}>{strings.game.reveal.coinLabel}</Text>
    </View>
  );
}

// « TA PLACE 4e → 2e ▲ » : rang avant et après la question. Ni le libellé ni le rang ne
// rétrécissent : s'ils ne tiennent pas sur une ligne (écran étroit, grande police), le rang passe
// à la ligne, aligné à droite.
export function PlaceBand({ rank, previousRank }: { rank: number; previousRank?: number }) {
  const { ordinal, reveal } = strings.game;
  // Rang inchangé (ou inconnu) : le rang seul, sans flèche.
  const value =
    previousRank === undefined || previousRank === rank
      ? ordinal(rank)
      : reveal.placeChange(ordinal(previousRank), ordinal(rank), rank < previousRank ? reveal.arrows.up : reveal.arrows.down);

  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{reveal.placeLabel}</Text>
      <Text style={styles.bandValue}>{value}</Text>
    </View>
  );
}

const COIN_GRADIENT = gradientStyle(AppCoinGradient);
const PART_ICON_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  partialTitle: {
    color: AppColors.accent,
  },
  coin: {
    alignSelf: 'center',
    width: AppSizes.coinSize,
    height: AppSizes.coinSize,
    borderRadius: AppSizes.coinSize / 2,
    borderWidth: AppSizes.coinBorder,
    borderColor: AppColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.hard,
  },
  softCoin: {
    borderColor: AppColors.surface,
    backgroundColor: AppColors.surface,
    boxShadow: 'none',
  },
  softCoinText: {
    color: AppColors.text,
  },
  coinPoints: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 54,
    lineHeight: Math.round(54 * DISPLAY_LINE_HEIGHT),
  },
  coinLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textTransform: 'uppercase',
  },
  parts: {
    gap: Spacing.two,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.inkSurface,
  },
  partIcon: {
    width: PART_ICON_SIZE,
    height: PART_ICON_SIZE,
    borderRadius: PART_ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partIconOk: {
    backgroundColor: AppColors.correct,
  },
  partIconWrong: {
    backgroundColor: AppColors.choices[0],
  },
  partTexts: {
    flex: 1,
    gap: 2,
  },
  partLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  partValue: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  partPoints: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  partPointsWon: {
    color: AppColors.correct,
  },
  partsNote: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  band: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  bandLabel: {
    flexShrink: 0,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 17,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  bandValue: {
    flexShrink: 0,
    marginLeft: 'auto',
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: 34,
  },
});
