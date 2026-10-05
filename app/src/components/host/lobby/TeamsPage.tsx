import { drawsAtLaunch, lobbyTeamRefusal, teamModeOf } from '@shared/teams';
import type { PlayerId, Session, TeamId, TeamMode } from '@shared/types';
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { TeamComposer } from './TeamComposer';

type Instruction = keyof typeof strings.teams.page.instructions;

// État de la page : la consigne d'une phrase, si elle signale un manque, et le bouton mis en avant.
interface PageStep {
  instruction: Instruction;
  isWarning: boolean;
  primary: 'draw' | 'validate';
}

function pageStep(session: Session): PageStep {
  const refusal = lobbyTeamRefusal(session);
  const mode = teamModeOf(session.settings);
  const atLaunch = drawsAtLaunch(session);
  if (refusal === 'teamsTooFewPlayers') return { instruction: 'tooFewPlayers', isWarning: true, primary: 'validate' };
  if (refusal === 'teamTooSmall') return { instruction: 'tooSmall', isWarning: true, primary: mode === 'random' && !atLaunch ? 'draw' : 'validate' };
  if (session.settings.teamMode === undefined && atLaunch) return { instruction: 'chooseMode', isWarning: false, primary: 'validate' };
  if (mode === 'random') {
    if (atLaunch) return { instruction: 'drawFirst', isWarning: false, primary: 'draw' };
    if (refusal === 'teamsUnassigned') return { instruction: 'lateJoiner', isWarning: true, primary: 'draw' };
    return { instruction: 'drawn', isWarning: false, primary: 'validate' };
  }
  if (refusal === 'teamsUnassigned') {
    return { instruction: mode === 'host' ? 'hostPlace' : 'playersChoose', isWarning: false, primary: 'validate' };
  }
  return { instruction: 'ready', isWarning: false, primary: 'validate' };
}

interface TeamsPageProps {
  session: Session;
  onMode: (mode: TeamMode) => void;
  onCount: (count: number) => void;
  onAssign: (playerId: PlayerId, team: TeamId | null) => void;
  onDraw: () => void;
  onClose: () => void;
  // « Valider les équipes » : publie l'heure de validation (son de la TV), puis ferme la page.
  onValidate: () => void;
}

// Page « Équipes » plein écran (maquette E1), ouverte depuis la ligne « Équipes » du salon : consigne,
// façon de former les équipes, nombre d'équipes, cartes d'équipe, « Sans équipe ». Les choix sont
// écrits tout de suite ; « Valider les équipes » et le retour ramènent simplement au salon.
export function TeamsPage({ session, onMode, onCount, onAssign, onDraw, onClose, onValidate }: TeamsPageProps) {
  const { page, composer } = strings.teams;
  const step = pageStep(session);
  const playerCount = Object.keys(session.players).length;
  const canValidate = lobbyTeamRefusal(session) === null;
  // « Ils choisissent » : pas de tirage, il écraserait les choix des joueurs.
  const canDraw = teamModeOf(session.settings) !== 'players' && step.instruction !== 'tooFewPlayers';
  const hasTeams = Object.values(session.players).some((player) => player.team !== undefined);

  // Bouton retour d'Android : ferme la page au lieu de quitter le salon.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  // Un seul bouton mis en avant (le gros bouton jaune), l'autre action en pilule discrète au-dessus.
  const draw = { label: hasTeams ? composer.redraw : composer.draw, onPress: onDraw, disabled: false };
  const validate = { label: page.validate, onPress: onValidate, disabled: !canValidate };
  const isDrawPrimary = canDraw && step.primary === 'draw';
  const primary = isDrawPrimary ? draw : validate;
  const secondary = isDrawPrimary ? validate : canDraw ? draw : null;
  const footer = (
    <View style={styles.footer}>
      {secondary && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: secondary.disabled }}
          disabled={secondary.disabled}
          onPress={secondary.onPress}
          style={({ pressed }) => [styles.discrete, pressed && styles.discretePressed, secondary.disabled && styles.discreteDisabled]}>
          <Text style={styles.discreteLabel}>{secondary.label}</Text>
        </Pressable>
      )}
      <BigButton label={primary.label} onPress={primary.onPress} disabled={primary.disabled} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={page.back} hitSlop={Spacing.two} onPress={onClose} style={styles.back}>
          <View style={styles.backIcon}>
            <SettingsIcon name="chevron" color={AppColors.text} />
          </View>
        </Pressable>
        <Text style={styles.title}>{composer.title}</Text>
        <Text style={styles.count}>{strings.teams.playerCount(playerCount)}</Text>
      </View>
      <View style={styles.guide}>
        <Text style={[styles.instruction, step.isWarning && styles.warning]}>{page.instructions[step.instruction]}</Text>
        <Text style={styles.help}>{page.minimumHelp}</Text>
      </View>
      <TeamComposer settings={session.settings} players={session.players} onMode={onMode} onCount={onCount} onAssign={onAssign} />
    </Screen>
  );
}

const BACK_SIZE = 40;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  back: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: BACK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.panel,
  },
  // Le chevron du réglage pointe vers la droite : retourné pour « retour ».
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  title: {
    ...TEXT_FIT_SAFETY,
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  count: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
  guide: {
    gap: Spacing.one,
  },
  help: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  instruction: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
  },
  warning: {
    color: AppColors.accent,
  },
  footer: {
    gap: Spacing.two,
  },
  discrete: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  discretePressed: {
    opacity: 0.7,
  },
  discreteDisabled: {
    opacity: 0.4,
  },
  discreteLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
