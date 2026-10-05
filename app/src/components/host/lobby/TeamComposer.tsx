import { MAX_TEAMS, MIN_TEAM_SIZE, MIN_TEAMS } from '@shared/constants';
import { activeTeams, TEAM_MODES, teamCountOf, teamMembers, teamModeOf } from '@shared/teams';
import type { Player, PlayerId, SessionSettings, TeamId, TeamMode } from '@shared/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TeamTile } from '@/components/ui/TeamSymbol';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface TeamComposerProps {
  settings: SessionSettings;
  players: Record<PlayerId, Player>;
  onMode: (mode: TeamMode) => void;
  onCount: (count: number) => void;
  onAssign: (playerId: PlayerId, team: TeamId | null) => void;
}

const TEAM_COUNTS = Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, index) => MIN_TEAMS + index);

// Composition des équipes dans le salon de l'hôte (maquette G1) : façon de former les équipes,
// nombre d'équipes, équipes et joueurs sans équipe. Dans tous les modes, l'hôte peut déplacer un
// joueur : il le touche, puis touche son équipe (ou « Sans équipe »). Le tirage est dans le pied.
export function TeamComposer({ settings, players, onMode, onCount, onAssign }: TeamComposerProps) {
  const { composer } = strings.teams;
  const playerIds = Object.keys(players);
  const teams = activeTeams(teamCountOf(settings, playerIds.length));
  const mode = teamModeOf(settings);
  const [selected, setSelected] = useState<PlayerId | null>(null);
  const unassigned = playerIds.filter((id) => !teams.includes(players[id].team as TeamId));
  // Avant tout placement (tirage pas encore fait), pas d'avertissement sur des équipes vides.
  const hasPlacements = unassigned.length < playerIds.length;

  function place(team: TeamId | null) {
    if (selected === null) return;
    onAssign(selected, team);
    setSelected(null);
  }

  function toggle(playerId: PlayerId) {
    setSelected((current) => (current === playerId ? null : playerId));
  }

  return (
    <View style={styles.container}>
      <View style={styles.segmented}>
        {TEAM_MODES.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: option === mode }}
            onPress={() => onMode(option)}
            style={[styles.segment, option === mode && styles.segmentOn]}>
            <Text style={[styles.segmentText, option === mode && styles.segmentTextOn]}>{composer.modes[option]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>{composer.modeHints[mode]}</Text>

      <View style={styles.countRow}>
        <Text style={styles.sectionLabel}>{composer.countLabel}</Text>
        <View style={styles.countButtons}>
          {TEAM_COUNTS.map((count) => (
            <Pressable
              key={count}
              accessibilityRole="button"
              accessibilityState={{ selected: count === teams.length }}
              onPress={() => onCount(count)}
              style={[styles.countButton, count === teams.length && styles.countOn]}>
              <Text style={[styles.countText, count === teams.length && styles.countTextOn]}>{count}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {teams.map((team) => (
        <TeamCard
          key={team}
          team={team}
          members={teamMembers(players, team)}
          players={players}
          selected={selected}
          showSizeWarning={hasPlacements}
          onPress={() => place(team)}
          onPlayer={toggle}
        />
      ))}

      {unassigned.length > 0 && (
        <View {...pressTarget(() => place(null))} style={styles.unassigned}>
          <Text style={styles.sectionLabel}>{composer.unassigned(unassigned.length)}</Text>
          <View style={styles.chips}>
            {unassigned.map((id) => (
              <PlayerChip key={id} player={players[id]} isSelected={selected === id} onPress={() => toggle(id)} />
            ))}
          </View>
          <Text style={styles.hint}>{composer.placeHint}</Text>
        </View>
      )}
      <Text style={[styles.hint, styles.centered]}>{strings.teams.averageNote}</Text>
    </View>
  );
}

interface TeamCardProps {
  team: TeamId;
  members: PlayerId[];
  players: Record<PlayerId, Player>;
  selected: PlayerId | null;
  showSizeWarning: boolean;
  onPress: () => void;
  onPlayer: (playerId: PlayerId) => void;
}

// Zone qui réagit au toucher sans être un bouton : elle contient les puces des joueurs, qui sont des
// boutons (un bouton ne peut pas en contenir un autre sur le web, et un rôle « button » en ferait un).
// Un appui sur une puce reste à la puce.
function pressTarget(onPress: () => void) {
  return { onStartShouldSetResponder: () => true, onResponderRelease: onPress };
}

// Carte d'équipe : bordure de sa couleur, pastille et nom, nombre de joueurs, joueurs en puces.
// Un appui sur la carte y place le joueur sélectionné.
function TeamCard({ team, members, players, selected, showSizeWarning, onPress, onPlayer }: TeamCardProps) {
  const name = strings.teams.names[team];
  const isTooSmall = showSizeWarning && members.length < MIN_TEAM_SIZE;
  return (
    <View
      accessibilityLabel={strings.teams.teamLabel(name)}
      {...pressTarget(onPress)}
      style={[styles.card, { borderColor: AppColors.teams[team] }, selected !== null && styles.cardTarget]}>
      <View style={styles.cardHeader}>
        <TeamTile team={team} size={28} />
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardCount}>{strings.teams.playerCount(members.length)}</Text>
      </View>
      {members.length > 0 && (
        <View style={styles.chips}>
          {members.map((id) => (
            <PlayerChip key={id} player={players[id]} isSelected={selected === id} onPress={() => onPlayer(id)} />
          ))}
        </View>
      )}
      {isTooSmall && <Text style={styles.warning}>{strings.teams.composer.tooSmall}</Text>}
    </View>
  );
}

function PlayerChip({ player, isSelected, onPress }: { player: Player; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected, !player.connected && styles.chipAway]}>
      <Text style={styles.chipAvatar}>{player.avatar}</Text>
      <Text style={styles.chipName}>{player.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.panel,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
  },
  segmentOn: {
    backgroundColor: AppColors.accent,
  },
  segmentText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textAlign: 'center',
  },
  segmentTextOn: {
    color: AppColors.onAccent,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  centered: {
    textAlign: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  countButton: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: AppColors.panel,
  },
  countOn: {
    backgroundColor: AppColors.accent,
  },
  countText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.display,
    fontSize: 18,
    lineHeight: Math.round(18 * DISPLAY_LINE_HEIGHT),
  },
  countTextOn: {
    color: AppColors.onAccent,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    backgroundColor: AppColors.panel,
  },
  cardTarget: {
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardName: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  cardCount: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingLeft: Spacing.one + 2,
    paddingRight: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.surface,
  },
  chipSelected: {
    borderColor: AppColors.selection,
  },
  chipAway: {
    opacity: 0.5,
  },
  chipAvatar: {
    fontSize: 18,
  },
  chipName: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  warning: {
    color: AppColors.highlight,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
  unassigned: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
  },
});
