import type { Player, PlayerId } from '@shared/types';
import type { ReviewBadge, ReviewGroup } from '@shared/validationReview';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DecisionToggle, EyeToggle } from './DecisionControls';

interface ReviewGroupCardProps {
  group: ReviewGroup;
  players: Record<PlayerId, Player>;
  onMain: (accepted: boolean) => void;
  onArtist: (accepted: boolean) => void;
  onToggleHidden: () => void;
}

// Un groupe de réponses identiques (maquette V1) : texte, badge, avatars et nombre de joueurs, œil
// pour masquer sur la TV, interrupteur ✓ / ✕ (deux, titre et artiste, pour un blind test « both »).
export function ReviewGroupCard({ group, players, onMain, onArtist, onToggleHidden }: ReviewGroupCardProps) {
  const { parts } = strings.hostValidation;
  const meta = <GroupMeta group={group} players={players} />;
  const eye = <EyeToggle hidden={group.hidden} onToggle={onToggleHidden} disabled={group.isFiltered} />;

  if (group.artist) {
    const [title, artist] = splitBoth(group.text, group.main.key, group.artist.key);
    return (
      <View style={[styles.card, group.hidden && styles.hiddenCard]}>
        <View style={styles.row}>
          {meta}
          {eye}
        </View>
        <View style={styles.row}>
          <View style={styles.texts}>
            <Text style={[styles.text, group.hidden && styles.hiddenText]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.text, group.hidden && styles.hiddenText]} numberOfLines={2}>
              {artist}
            </Text>
          </View>
          <View style={styles.partToggles}>
            <PartToggle label={parts.title} accepted={group.main.accepted} onChange={onMain} />
            <PartToggle label={parts.artist} accepted={group.artist.accepted} onChange={onArtist} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.row, group.hidden && styles.hiddenCard]}>
      <View style={styles.texts}>
        <Text style={[styles.text, group.hidden && styles.hiddenText]} numberOfLines={2}>
          {group.text}
        </Text>
        {meta}
      </View>
      {eye}
      <DecisionToggle label={group.text} accepted={group.main.accepted} onChange={onMain} />
    </View>
  );
}

// « both » : texte « titre – artiste » ; une partie vide s'affiche « (vide) ».
function splitBoth(text: string, titleKey: string, artistKey: string): [string, string] {
  const { emptyPart } = strings.hostValidation;
  if (titleKey === '') return [emptyPart, text];
  if (artistKey === '') return [text, emptyPart];
  const separator = text.lastIndexOf(' – ');
  return separator < 0 ? [text, emptyPart] : [text.slice(0, separator), text.slice(separator + 3)];
}

function PartToggle({ label, accepted, onChange }: { label: string; accepted: boolean; onChange: (accepted: boolean) => void }) {
  return (
    <View style={styles.partToggle}>
      <Text style={styles.partLabel}>{label}</Text>
      <DecisionToggle label={label} accepted={accepted} onChange={onChange} />
    </View>
  );
}

const MAX_AVATARS = 4;

function GroupMeta({ group, players }: { group: ReviewGroup; players: Record<PlayerId, Player> }) {
  const shown = group.playerIds.slice(0, MAX_AVATARS);
  return (
    <View style={styles.meta}>
      <Badge badge={group.badge} />
      <View style={styles.avatars}>
        {shown.map((playerId) => (
          <View key={playerId} style={styles.avatar}>
            <Text style={styles.avatarText}>{players[playerId]?.avatar ?? '?'}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.count}>{strings.hostValidation.playerCount(group.playerIds.length)}</Text>
    </View>
  );
}

// Badges pleins (décision nette) ou contour (à vérifier par l'hôte), comme sur la maquette.
const BADGE_STYLES: Record<ReviewBadge, { fill?: string; outline?: string; text: string }> = {
  exact: { fill: AppColors.correct, text: AppColors.ink },
  alias: { fill: AppColors.correct, text: AppColors.ink },
  typo: { fill: AppColors.accent, text: AppColors.ink },
  close: { outline: AppColors.link, text: AppColors.link },
  allInTitle: { outline: AppColors.link, text: AppColors.link },
  wrong: { fill: AppColors.choices[0], text: AppColors.ink },
  hidden: { fill: AppColors.choices[0], text: AppColors.ink },
};

function Badge({ badge }: { badge: ReviewBadge }) {
  const look = BADGE_STYLES[badge];
  return (
    <View style={[styles.badge, look.fill ? { backgroundColor: look.fill } : { borderColor: look.outline, borderWidth: 1.5 }]}>
      <Text style={[styles.badgeText, { color: look.text }]}>{strings.hostValidation.badges[badge]}</Text>
    </View>
  );
}

const AVATAR_SIZE = 24;
// Largeur commune des libellés « TITRE » et « ARTISTE » : les deux interrupteurs s'alignent.
const PART_LABEL_WIDTH = 56;

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  hiddenCard: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  texts: {
    flex: 1,
    gap: Spacing.one,
  },
  text: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  hiddenText: {
    color: AppColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: -4,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
  },
  avatarText: {
    fontSize: 14,
  },
  count: {
    ...TEXT_FIT_SAFETY,
    marginLeft: Spacing.one,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
  },
  badgeText: {
    ...TEXT_FIT_SAFETY,
    fontFamily: AppFonts.black,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  partToggles: {
    gap: Spacing.one + 2,
  },
  partToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  partLabel: {
    width: PART_LABEL_WIDTH,
    textAlign: 'right',
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
