import type { TeamRow } from '@shared/teams';
import type { TeamId } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { TeamSymbol, TeamTile } from '@/components/ui/TeamSymbol';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';
import { PlayerName } from '@/components/ui/PlayerName';

import { PlaceBand } from './PlaceBand';
import { EndView } from './StatusViews';

// Groupe, téléphone du joueur (maquette G4) : pastille d'équipe, classement des équipes, fin de partie.

// Ce que le joueur voit de son équipe : la sienne, le classement des équipes, son rang dans l'équipe.
export interface TeamGameInfo {
  team: TeamId;
  rows: TeamRow[];
  inTeam: { rank: number; size: number } | null;
}

export function teamRankOf(info: TeamGameInfo): number {
  return info.rows.find((row) => row.team === info.team)?.rank ?? 1;
}

// « ★ ÉQUIPE ROSE » : pastille à la couleur de l'équipe, en haut des écrans de partie.
export function TeamChip({ team }: { team: TeamId }) {
  return (
    <View style={[styles.chip, { backgroundColor: AppColors.teams[team] }]}>
      <TeamSymbol team={team} size={14} color={AppColors.onTeam} />
      <Text style={styles.chipText}>{strings.teams.teamLabel(strings.teams.names[team])}</Text>
    </View>
  );
}

// Classement des équipes : rang, pastille, nom (« · ton équipe »), moyenne ; la sienne encadrée.
function TeamRows({ info }: { info: TeamGameInfo }) {
  return (
    <View style={styles.rows}>
      {info.rows.map((row) => {
        const isMine = row.team === info.team;
        return (
          <View key={row.team} style={[styles.row, isMine && { borderColor: AppColors.teams[row.team] }]}>
            <Text style={[styles.rowRank, row.rank === 1 && styles.firstRank]}>{row.rank}</Text>
            <TeamTile team={row.team} size={32} />
            <Text style={styles.rowName} numberOfLines={1}>
              {strings.teams.names[row.team]}
              {isMine && <Text style={styles.rowMine}>{strings.teams.game.mine}</Text>}
            </Text>
            <Text style={styles.rowScore}>{strings.teams.game.points(row.score)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Écran Classement (maquette R2), seul endroit où l'on parle de rang : classement des équipes, ce
// qu'est le score d'une équipe, puis le rang du joueur dans son équipe.
export function TeamScoresView({ info }: { info: TeamGameInfo }) {
  const { game } = strings.teams;
  return (
    <View style={styles.block}>
      <TeamChip team={info.team} />
      <Text style={styles.sectionTitle}>{game.rankingTitle}</Text>
      <TeamRows info={info} />
      <Text style={styles.note}>{strings.teams.averageNote}</Text>
      {info.inTeam && (
        <View style={styles.youBlock}>
          <Text style={styles.sectionLabel}>{game.you}</Text>
          <PlaceBand label={game.inYourTeam} rank={info.inTeam.rank} suffix={game.outOf(info.inTeam.size)} />
        </View>
      )}
    </View>
  );
}

interface TeamEndViewProps {
  info: TeamGameInfo;
  me: RankedPlayer | undefined;
  playerCount: number;
  isBestOfTeam: boolean;
  onShowPlayers: () => void;
}

// Fin de partie : place de l'équipe, classement des équipes, puis la carte du joueur ; un bouton
// mène au classement des joueurs.
export function TeamEndView({ info, me, playerCount, isBestOfTeam, onShowPlayers }: TeamEndViewProps) {
  const { game } = strings.teams;
  const teamRank = teamRankOf(info);
  const title = teamRank === 1 ? game.endWinner : game.endPlace(strings.game.ordinal(teamRank));
  return (
    <View style={styles.endBlock}>
      <Text style={[textStyles.hero, styles.endTitle]}>{title}</Text>
      <TeamRows info={info} />
      {me && (
        <>
          <Text style={styles.sectionLabel}>{game.you}</Text>
          <View style={styles.meCard}>
            <View style={styles.meAvatar}>
              <Text style={styles.meAvatarText}>{me.avatar}</Text>
            </View>
            <View style={styles.meTexts}>
              <PlayerName name={me.name} style={styles.meName} />
              {isBestOfTeam && <Text style={styles.note}>{game.bestOfTeam}</Text>}
            </View>
            <View style={styles.meRank}>
              <Text style={styles.meRankValue}>{strings.game.ordinal(me.rank)}</Text>
              <Text style={styles.note}>{game.playerDetail(playerCount, me.score)}</Text>
            </View>
          </View>
        </>
      )}
      <View style={styles.endButton}>
        <BigButton label={game.showPlayers} onPress={onShowPlayers} />
      </View>
    </View>
  );
}

interface TeamEndScreenProps {
  info: TeamGameInfo;
  players: RankedPlayer[];
  uid: string;
  isBestOfTeam: boolean;
}

// Fin de partie en Groupe : classement des équipes d'abord, puis, sur demande, celui des joueurs.
export function TeamEndScreen({ info, players, uid, isBestOfTeam }: TeamEndScreenProps) {
  const [showPlayers, setShowPlayers] = useState(false);
  if (showPlayers) {
    return (
      <View style={styles.endBlock}>
        <EndView players={players} uid={uid} />
        <View style={styles.endButton}>
          <BigButton label={strings.teams.game.showTeams} variant="secondary" onPress={() => setShowPlayers(false)} />
        </View>
      </View>
    );
  }
  return (
    <TeamEndView
      info={info}
      me={players.find((player) => player.id === uid)}
      playerCount={players.length}
      isBestOfTeam={isBestOfTeam}
      onShowPlayers={() => setShowPlayers(true)}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
  },
  chipText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onTeam,
    fontFamily: AppFonts.black,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  note: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  youBlock: {
    gap: Spacing.two,
  },
  block: {
    gap: Spacing.three,
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 22,
    lineHeight: Math.round(22 * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  sectionLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rows: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.inkSurface,
  },
  rowRank: {
    ...TEXT_FIT_SAFETY,
    width: 22,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 20,
    lineHeight: Math.round(20 * DISPLAY_LINE_HEIGHT),
  },
  firstRank: {
    color: AppColors.accent,
  },
  rowName: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  rowMine: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
  },
  rowScore: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  endBlock: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  endTitle: {
    color: AppColors.accent,
  },
  meCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.inkSurface,
  },
  meAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.card,
  },
  meAvatarText: {
    fontSize: 24,
  },
  meTexts: {
    flex: 1,
    gap: 2,
  },
  meName: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  meRank: {
    alignItems: 'flex-end',
  },
  meRankValue: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: Math.round(26 * DISPLAY_LINE_HEIGHT),
  },
  endButton: {
    marginTop: 'auto',
  },
});
