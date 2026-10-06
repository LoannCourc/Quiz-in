import type { PlayerId, SessionSettings, TeamId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useJoinedTeamNotice } from '@/hooks/useJoinedTeamNotice';
import type { LobbyPlayers } from '@/lib/joinGame';

import { PlayerTeamLobby } from './PlayerTeamLobby';

interface PlayerLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
  // Groupe : réglages de la partie et choix de l'équipe (mode « Ils choisissent »).
  teams?: { settings: SessionSettings; onChoose: (team: TeamId) => void; error: string | null };
}

// Lobby du joueur : son avatar en grand et le message principal, rien d'autre (la TV montre déjà
// les joueurs et les équipes). Le bouton « Modifier mon profil » est fourni à part, en pied d'écran.
export function PlayerLobby({ uid, players, teams }: PlayerLobbyProps) {
  const me = players[uid];
  const joinedTeam = useJoinedTeamNotice(teams ? me?.team : undefined);
  // Groupe, mode « Ils choisissent » : le choix de l'équipe remplace le lobby (maquette G1).
  if (teams && teams.settings.teamMode === 'players') {
    return <PlayerTeamLobby uid={uid} players={players} {...teams} />;
  }

  return (
    <View style={styles.lobby}>
      {me && (
        <View style={styles.me}>
          <View style={styles.bigDisc}>
            <Text style={styles.bigAvatar}>{me.avatar}</Text>
          </View>
          <Text style={styles.myName}>{me.name}</Text>
        </View>
      )}
      {joinedTeam && <Text style={styles.joined}>{strings.teams.joined(strings.teams.names[joinedTeam])}</Text>}
      <Text style={textStyles.hero}>{strings.lobby.inLobbyTitle}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.lobby.waiting}</Text>
    </View>
  );
}

const BIG_DISC = 104;

const styles = StyleSheet.create({
  lobby: {
    gap: Spacing.three,
  },
  me: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  bigDisc: {
    width: BIG_DISC,
    height: BIG_DISC,
    borderRadius: BIG_DISC / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: AppSizes.coinBorder,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  bigAvatar: {
    fontSize: 58,
  },
  myName: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: Math.round(26 * DISPLAY_LINE_HEIGHT),
  },
  centered: {
    textAlign: 'center',
  },
  joined: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 18,
    textAlign: 'center',
  },
});
