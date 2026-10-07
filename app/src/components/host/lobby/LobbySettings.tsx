import { MIN_TEAM_GAME_PLAYERS } from '@shared/constants';
import type { Session } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionToggle } from '@/components/host/OptionToggle';
import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { TeamsSummaryRow } from './TeamsSummaryRow';

const texts = strings.hostLobby.settings;

// Ligne unique « Réglages · équipes, je joue aussi › » du salon (maquette N2) : elle ouvre la feuille.
export function LobbySettingsRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${texts.title} : ${texts.summary}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={styles.rowText}>
        <Text style={styles.rowTitle}>{texts.title}</Text>
        <Text style={styles.rowSummary}>{` · ${texts.summary}`}</Text>
      </Text>
      <SettingsIcon name="chevron" color={AppColors.text} />
    </Pressable>
  );
}

interface LobbySettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  // Groupe : activé ou coupé (dès MIN_TEAM_GAME_PLAYERS joueurs) ; page « Équipes ».
  onTeamsEnabled: (enabled: boolean) => void;
  onOpenTeams: () => void;
  // L'hôte s'inscrit (« Je joue aussi ») ou modifie son pseudo et son avatar.
  isHostRegistered: boolean;
  onHostProfile: () => void;
  // Partie courte (développement seulement).
  isShortGame: boolean;
  onShortGame: (value: boolean) => void;
}

// Feuille « Réglages » du salon : Équipes, « Je joue aussi », et Partie courte en développement.
export function LobbySettingsSheet(props: LobbySettingsSheetProps) {
  const { isOpen, onClose, session, onTeamsEnabled, onOpenTeams, isHostRegistered, onHostProfile, isShortGame, onShortGame } = props;
  const isTeams = session.settings.teams;
  const playerCount = Object.keys(session.players).length;
  // Coupé avec trop peu de joueurs : activation impossible (le salon le dit) ; activé, on peut toujours couper.
  const disabledReason = !isTeams && playerCount < MIN_TEAM_GAME_PLAYERS ? texts.teamsMinPlayers : undefined;
  const closeThen = (action: () => void) => () => {
    onClose();
    action();
  };
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Text style={styles.sheetTitle}>{texts.title}</Text>
      <View style={styles.section}>
        <OptionToggle title={texts.teamsTitle} hint={texts.teamsHint} value={isTeams} onChange={onTeamsEnabled} disabledReason={disabledReason} />
        {isTeams && <TeamsSummaryRow session={session} onPress={closeThen(onOpenTeams)} />}
      </View>
      <BigButton
        label={isHostRegistered ? texts.editProfile : strings.hostLobby.hostCard.button}
        variant="secondary"
        size="compact"
        onPress={closeThen(onHostProfile)}
      />
      {/* Partie courte : tests manuels, absente de l'app publiée (__DEV__ faux). */}
      {__DEV__ && (
        <OptionToggle
          title={strings.hostLobby.shortGame.title}
          hint={strings.hostLobby.shortGame.hint}
          value={isShortGame}
          onChange={onShortGame}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Panneau plein, sans icône à gauche, flèche à droite (maquette N2).
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 56,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.lobbyPanel,
  },
  pressed: {
    opacity: 0.8,
  },
  rowText: {
    ...TEXT_FIT_SAFETY,
    flex: 1,
  },
  rowTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  rowSummary: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  sheetTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
  },
});
