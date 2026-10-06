import { activeTeams, drawsAtLaunch, lobbyTeamRefusal, teamAssignment, teamCountOf, teamModeOf } from '@shared/teams';
import type { Session } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { TeamTile } from '@/components/ui/TeamSymbol';
import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// État des équipes en quelques mots : tirage à venir, prêtes, ou à compléter (la raison exacte est
// sous « Lancer la partie » et sur la page « Équipes »).
function teamsStatus(session: Session): string {
  const { row } = strings.teams;
  const refusal = lobbyTeamRefusal(session);
  if (refusal === 'teamsUnassigned') return row.unassigned(teamAssignment(session).unassigned);
  if (refusal !== null) return row.incomplete;
  return drawsAtLaunch(session) ? row.drawAtLaunch : row.ready;
}

// Ligne « Équipes · Au hasard · 3 équipes · tirage au lancement › » du salon (maquette L1) : un
// appui ouvre la page « Équipes ».
export function TeamsSummaryRow({ session, onPress }: { session: Session; onPress: () => void }) {
  const { row, composer } = strings.teams;
  const teams = activeTeams(teamCountOf(session.settings, Object.keys(session.players).length));
  const summary = row.summary([composer.modes[teamModeOf(session.settings)], row.teamCount(teams.length), teamsStatus(session)]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.title} : ${summary}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.tiles}>
        {teams.map((team, index) => (
          <View key={team} style={index > 0 && styles.overlap}>
            <TeamTile team={team} size={32} />
          </View>
        ))}
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{row.title}</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
      <SettingsIcon name="chevron" color={AppColors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.panel,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    boxShadow: AppShadows.pressed,
  },
  tiles: {
    flexDirection: 'row',
  },
  overlap: {
    marginLeft: -6,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  summary: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
});
