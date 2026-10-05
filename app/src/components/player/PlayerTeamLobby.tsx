import { activeTeams, TEAM_IDS, teamCountOf, teamMembers, teamModeOf } from '@shared/teams';
import type { PlayerId, SessionSettings, TeamId } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { TeamSymbol, TeamTile } from '@/components/ui/TeamSymbol';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

interface PlayerTeamLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
  settings: SessionSettings;
  // Mode « Ils choisissent » : choix de l'équipe (écriture du joueur, refusée hors de ce mode).
  onChoose: (team: TeamId) => void;
  error: string | null;
}

// Groupe, lobby du joueur (maquette G1) : en mode « Ils choisissent », les équipes en grandes cartes à
// toucher ; sinon, l'équipe où l'hôte l'a placé (ou « L'hôte forme les équipes… »).
export function PlayerTeamLobby({ uid, players, settings, onChoose, error }: PlayerTeamLobbyProps) {
  const { picker } = strings.teams;
  const teams = activeTeams(teamCountOf(settings, Object.keys(players).length));
  const myTeam = players[uid]?.team;

  if (teamModeOf(settings) !== 'players') {
    return (
      <View style={styles.container}>
        {myTeam ? (
          <View style={styles.myTeam}>
            <Text style={styles.label}>{picker.yourTeam}</Text>
            <TeamCard team={myTeam} players={players} isMine onPress={undefined} />
          </View>
        ) : (
          <Text style={[textStyles.label, styles.centered]}>{picker.notAssigned}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{picker.title}</Text>
      <Text style={styles.note}>{picker.hint}</Text>
      <View style={styles.grid}>
        {TEAM_IDS.map((team) =>
          teams.includes(team) ? (
            <TeamCard key={team} team={team} players={players} isMine={team === myTeam} onPress={() => onChoose(team)} />
          ) : (
            <View key={team} style={[styles.card, styles.unusedCard]}>
              <Text style={[styles.note, styles.centered]}>{picker.unused(strings.teams.names[team])}</Text>
            </View>
          ),
        )}
      </View>
      {error && <Text style={[textStyles.error, styles.centered]}>{error}</Text>}
      <Text style={[textStyles.label, styles.centered]}>{picker.waiting}</Text>
      <Text style={[styles.note, styles.centered]}>{picker.hostCanMove}</Text>
    </View>
  );
}

interface TeamCardProps {
  team: TeamId;
  players: LobbyPlayers;
  isMine: boolean;
  // Absent : carte d'information (l'équipe a été choisie par l'hôte).
  onPress: (() => void) | undefined;
}

// Carte d'équipe à sa couleur : symbole, nom, nombre de joueurs, avatars ; contour blanc et
// étiquette « Ton équipe » pour celle du joueur.
function TeamCard({ team, players, isMine, onPress }: TeamCardProps) {
  const members = teamMembers(players, team);
  const name = strings.teams.names[team];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={strings.teams.teamLabel(name)}
      accessibilityState={{ selected: isMine }}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, { backgroundColor: AppColors.teams[team] }, isMine && styles.myCard]}>
      <View style={styles.cardTop}>
        <TeamSymbol team={team} size={30} color={AppColors.onTeam} />
        {isMine && (
          <View style={styles.mineTag}>
            <Text style={styles.mineTagText}>{strings.teams.picker.yourTeam}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardName}>{name}</Text>
      <Text style={styles.cardCount}>{strings.teams.playerCount(members.length)}</Text>
      <View style={styles.avatars}>
        {members.map((id) => (
          <View key={id} style={styles.avatar}>
            <Text style={styles.avatarText}>{players[id].avatar}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

// Pastille d'équipe à côté d'un pseudo (liste des joueurs, en-tête de partie).
export function TeamBadge({ team }: { team: TeamId }) {
  return <TeamTile team={team} size={22} />;
}

const AVATAR = 26;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  title: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: Math.round(26 * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  label: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  note: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  centered: {
    textAlign: 'center',
  },
  myTeam: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 150,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 4,
    borderColor: 'transparent',
    boxShadow: AppShadows.hard,
  },
  myCard: {
    borderColor: AppColors.selection,
  },
  unusedCard: {
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
    boxShadow: 'none',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  mineTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  mineTagText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  cardName: {
    ...TEXT_FIT_SAFETY,
    marginTop: Spacing.two,
    color: AppColors.onTeam,
    fontFamily: AppFonts.black,
    fontSize: 18,
  },
  cardCount: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onTeam,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.one,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    marginRight: -4,
    borderRadius: AVATAR / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.card,
  },
  avatarText: {
    fontSize: 15,
  },
});
