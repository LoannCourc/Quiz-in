import { connectedPlayerIds } from '@shared/players';
import type { PublicSession } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { GameIcon } from '@/components/host/home/GameIcon';
import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useJoinGameType } from '@/hooks/useJoinGameType';

const DISC_SIZE = 48;
const ICON_SIZE = 26;

interface JoinGameCardProps {
  code: string;
  session: Pick<PublicSession, 'quizId' | 'settings' | 'players' | 'hostUid'>;
}

// Carte de la partie rejointe (maquette J3) : couleur et icône du jeu, « PARTIE K7LQ », le nom du jeu,
// puis « Hôte : Loann · 3 joueurs connectés ». Le nom de l'hôte n'est connu que s'il joue (« Je joue
// aussi ») : sinon, seul le nombre de joueurs.
export function JoinGameCard({ code, session }: JoinGameCardProps) {
  const game = useJoinGameType(session);
  const host = session.players[session.hostUid];
  const count = connectedPlayerIds(session.players).length;
  const texts = strings.join.gameCard;
  const details = host ? `${texts.host(host.name)} · ${texts.players(count)}` : texts.players(count);
  return (
    <View style={[styles.card, { backgroundColor: AppColors.gameTiles[game] }]}>
      <View style={styles.disc}>
        <GameIcon game={game} size={ICON_SIZE} color={AppColors.gameTiles[game]} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.room}>{texts.room(code)}</Text>
        <Text style={styles.name}>{strings.home.games[game].name}</Text>
        <Text style={styles.details}>{details}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 3,
    borderColor: AppColors.gameTileBorder,
    boxShadow: AppShadows.hardInk,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  room: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onGameTile,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    color: AppColors.onGameTile,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
  details: {
    color: AppColors.onGameTile,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
});
