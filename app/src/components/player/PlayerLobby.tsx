import type { PlayerId, SessionSettings, TeamId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { BluffRulesCard } from '@/components/ui/BluffRules';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useJoinedTeamNotice } from '@/hooks/useJoinedTeamNotice';
import type { LobbyPlayers } from '@/lib/joinGame';
import { FittedLine } from '@/components/ui/FittedLine';
import { PlayerName } from '@/components/ui/PlayerName';

import { PlayerTeamLobby } from './PlayerTeamLobby';

interface PlayerLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
  // Groupe : réglages de la partie et choix de l'équipe (mode « Ils choisissent »).
  teams?: { settings: SessionSettings; onChoose: (team: TeamId) => void; error: string | null };
  // Ligne sous le titre, à la place de « En attente du lancement… » (Changer de jeu : l'hôte choisit).
  message?: string;
  // Quiz fixe ou blind test : son titre et son niveau (« Électro des années 80 · Moyen »).
  quizName?: string | null;
  // Partie de Bluff : carte des règles (ouverte la première fois sur ce téléphone). Démos : état imposé.
  bluffRules?: { initiallyOpen?: boolean };
}

// Lobby du joueur : son avatar en grand et le message principal, rien d'autre (la TV montre déjà
// les joueurs et les équipes). Le bouton « Modifier mon profil » est fourni à part, en pied d'écran.
export function PlayerLobby({ uid, players, teams, message = strings.lobby.waiting, quizName, bluffRules }: PlayerLobbyProps) {
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
          <PlayerName name={me.name} style={styles.myName} />
        </View>
      )}
      {joinedTeam && <Text style={styles.joined}>{strings.teams.joined(strings.teams.names[joinedTeam])}</Text>}
      <Text style={textStyles.hero}>{strings.lobby.inLobbyTitle}</Text>
      <Text style={[textStyles.label, styles.centered]}>{message}</Text>
      {quizName && <FittedLine text={quizName} style={styles.quizName} minSize={QUIZ_NAME_MIN_SIZE} />}
      {bluffRules && <BluffRulesCard initiallyOpen={bluffRules.initiallyOpen} />}
    </View>
  );
}

const BIG_DISC = 104;
const QUIZ_NAME_SIZE = 17;
const QUIZ_NAME_MIN_SIZE = 12;

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
  quizName: {
    color: AppColors.accent,
    fontFamily: AppFonts.extraBold,
    fontSize: QUIZ_NAME_SIZE,
    textAlign: 'center',
  },
  joined: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 18,
    textAlign: 'center',
  },
});
