import { DRAW_ROUND_CHOICES, drawRoundsOf } from '@shared/drawGame';
import { MIN_TEAM_GAME_PLAYERS, PLAYER_NAME_MAX_LENGTH } from '@shared/constants';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';
import { connectedPlayerIds } from '@shared/players';
import type { Session } from '@shared/types';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { GameIcon } from '@/components/host/home/GameIcon';
import { OptionToggle } from '@/components/host/OptionToggle';
import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AvatarPicker } from '@/components/player/AvatarPicker';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { firstFreeAvatar, getJoinRefusal, registerPlayer } from '@/lib/joinGame';

import { TeamsSummaryRow } from './TeamsSummaryRow';

const texts = strings.hostLobby.settings;

// Ligne unique « Réglages · équipes, je joue aussi › » du salon (maquette N2) : elle ouvre la feuille.
export function LobbySettingsRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${texts.title} : ${texts.summary}`}
      onPress={onPress}
      style={({ pressed }) => [styles.entryRow, pressed && styles.pressed]}>
      <Text style={styles.entryText}>
        <Text style={styles.entryTitle}>{texts.title}</Text>
        <Text style={styles.entrySummary}>{` · ${texts.summary}`}</Text>
      </Text>
      <SettingsIcon name="chevron" color={AppColors.text} />
    </Pressable>
  );
}

interface LobbySettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  session: Session;
  // Dessine-moi : nombre de manches (4, 6 ou 8).
  onRounds: (rounds: number) => void;
  // Groupe : activé ou coupé (dès MIN_TEAM_GAME_PLAYERS joueurs) ; page « Équipes ».
  onTeamsEnabled: (enabled: boolean) => void;
  onOpenTeams: () => void;
  // « Quitter » : l'hôte qui jouait se retire de la partie.
  onHostLeave: () => void;
  // Développement seulement : partie courte, un seul dessinateur (Dessine-moi).
  isShortGame: boolean;
  onShortGame: (value: boolean) => void;
  isSingleDrawer: boolean;
  onSingleDrawer: (value: boolean) => void;
}

// Feuille « Réglages » du salon (maquette R4) : nombre de manches (Dessine-moi), équipes, « Je joue aussi »
// (prénom, avatar, « Rejoindre la partie », puis « Tu joues : … » et « Quitter »), bloc Développement.
export function LobbySettingsSheet(props: LobbySettingsSheetProps) {
  const { isOpen, onClose, code, session, onRounds, onTeamsEnabled, onOpenTeams, onHostLeave } = props;
  const isDraw = session.settings.answerMode === 'draw';
  const isTeams = session.settings.teams;
  const playerCount = Object.keys(session.players).length;
  // Coupé avec trop peu de joueurs : activation impossible ; activé, on peut toujours couper.
  const canTeams = isTeams || playerCount >= MIN_TEAM_GAME_PLAYERS;
  const closeThen = (action: () => void) => () => {
    onClose();
    action();
  };
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={texts.title} aside={texts.playerCount(connectedPlayerIds(session.players).length)}>
      {isDraw && (
        <SettingRow
          icon={<GameIcon game="draw" size={ICON_SIZE} color={AppColors.accent} />}
          title={texts.roundsTitle}
          hint={texts.roundsHint}
          right={<RoundsPicker value={drawRoundsOf(session.settings)} onChange={onRounds} />}
        />
      )}
      <SettingRow
        icon={<SettingsIcon name="group" color={AppColors.accent} />}
        title={texts.teamsTitle}
        hint={canTeams ? texts.teamsHint : texts.teamsMinPlayers}
        isDisabled={!canTeams}
        right={<Toggle value={isTeams} onChange={onTeamsEnabled} isDisabled={!canTeams} label={texts.teamsTitle} />}>
        {isTeams && <TeamsSummaryRow session={session} onPress={closeThen(onOpenTeams)} />}
      </SettingRow>
      <HostPlayRow code={code} session={session} onLeave={onHostLeave} />
      {__DEV__ && <DevelopmentBlock {...props} isDraw={isDraw} />}
    </BottomSheet>
  );
}

const ICON_SIZE = 22;

interface SettingRowProps {
  icon: ReactNode;
  title: string;
  hint: string;
  hintTone?: 'muted' | 'success';
  // À droite du titre : interrupteur, lien, ou rien (contrôle en dessous, dans children si trop large).
  right?: ReactNode;
  // Sous la ligne : formulaire « Je joue aussi », ligne des équipes. Un contrôle trop large pour la ligne
  // (4 / 6 / 8 avec une grande police) passe dessous tout seul.
  children?: ReactNode;
  isDisabled?: boolean;
  isHighlighted?: boolean;
}

// Ligne de réglage homogène (maquette R4) : icône ronde, titre, phrase, et l'interrupteur ou le contrôle.
function SettingRow({ icon, title, hint, hintTone = 'muted', right, children, isDisabled = false, isHighlighted = false }: SettingRowProps) {
  return (
    <View style={[styles.card, isHighlighted && styles.highlighted]}>
      <View style={[styles.row, isDisabled && styles.disabled]}>
        <View style={styles.iconDisc}>{icon}</View>
        <View style={styles.texts}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={[styles.hint, hintTone === 'success' && styles.success]}>{hint}</Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

function Toggle({ value, onChange, isDisabled = false, label }: { value: boolean; onChange: (value: boolean) => void; isDisabled?: boolean; label: string }) {
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      disabled={isDisabled}
      trackColor={{ true: AppColors.link, false: AppColors.inkSurface }}
      thumbColor={AppColors.text}
    />
  );
}

// 4 / 6 / 8 : le choix est une pastille jaune.
function RoundsPicker({ value, onChange }: { value: number; onChange: (rounds: number) => void }) {
  return (
    <View style={styles.rounds} accessibilityRole="radiogroup">
      {DRAW_ROUND_CHOICES.map((choice) => {
        const isSelected = choice === value;
        return (
          <Pressable
            key={choice}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={texts.roundsChoice(choice)}
            onPress={() => onChange(choice)}
            style={[styles.roundChoice, isSelected && styles.roundSelected]}>
            <Text style={[styles.roundLabel, isSelected && styles.roundLabelSelected]}>{choice}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// « Je joue aussi » : éteint (A), ouvert sur le prénom et l'avatar (B), puis « Tu joues : … » (C).
function HostPlayRow({ code, session, onLeave }: { code: string; session: Session; onLeave: () => void }) {
  const uid = session.hostUid;
  const hostPlayer = session.players[uid];
  const [isOpen, setIsOpen] = useState(false);
  if (hostPlayer) {
    return (
      <SettingRow
        icon={<Text style={styles.avatar}>{hostPlayer.avatar}</Text>}
        title={texts.playing(hostPlayer.name)}
        hint={texts.playingHint}
        hintTone="success"
        right={
          <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={onLeave}>
            <Text style={styles.link}>{texts.leave}</Text>
          </Pressable>
        }
      />
    );
  }
  return (
    <SettingRow
      icon={<SettingsIcon name="person" color={AppColors.accent} />}
      title={texts.playTitle}
      hint={isOpen ? texts.playHintOpen : texts.playHint}
      isHighlighted={isOpen}
      right={<Toggle value={isOpen} onChange={setIsOpen} label={texts.playTitle} />}>
      {isOpen && <HostJoinForm code={code} session={session} />}
    </SettingRow>
  );
}

// Prénom, avatars sur une ligne (même jeu et même rendu que les joueurs), « Rejoindre la partie ».
function HostJoinForm({ code, session }: { code: string; session: Session }) {
  const uid = session.hostUid;
  const [rawName, setRawName] = useState('');
  const [avatar, setAvatar] = useState(() => firstFreeAvatar(session.players));
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const name = cleanPlayerName(rawName);
  const canJoin = isValidPlayerName(name) && !isJoining;

  async function join() {
    if (!canJoin) return;
    const refusal = getJoinRefusal(session.status, session.players, uid, name);
    if (refusal) {
      setError(strings.join.refusals[refusal]);
      return;
    }
    setError(null);
    setIsJoining(true);
    try {
      // La feuille passe d'elle-même à « Tu joues : … » quand le joueur apparaît dans la partie.
      await registerPlayer(code, uid, name, avatar);
    } catch {
      setError(strings.join.submitFailed);
      setIsJoining(false);
    }
  }

  return (
    <View style={styles.joinForm}>
      <TextInput
        value={rawName}
        onChangeText={(text) => {
          setRawName(text);
          setError(null);
        }}
        onSubmitEditing={join}
        placeholder={texts.namePlaceholder}
        placeholderTextColor={AppColors.textMuted}
        maxLength={PLAYER_NAME_MAX_LENGTH}
        autoCorrect={false}
        autoComplete="off"
        returnKeyType="done"
        accessibilityLabel={strings.join.nameLabel}
        style={styles.nameInput}
      />
      <AvatarPicker layout="row" selected={avatar} onSelect={setAvatar} fadeColor={AppColors.lobbyPanel} />
      <Text style={styles.hint}>{texts.scrollHint}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canJoin }}
        disabled={!canJoin}
        onPress={join}
        style={({ pressed }) => [styles.joinButton, !canJoin && styles.disabled, pressed && styles.pressed]}>
        <ButtonLabel style={styles.joinLabel}>{isJoining ? texts.joining : texts.joinButton}</ButtonLabel>
      </Pressable>
    </View>
  );
}

// Bloc « Développement » (absent de l'app publiée) : ligne en pointillés repliable.
function DevelopmentBlock(props: LobbySettingsSheetProps & { isDraw: boolean }) {
  const { isShortGame, onShortGame, isSingleDrawer, onSingleDrawer, isDraw } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View style={styles.devBlock}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(!isOpen)}
        style={({ pressed }) => [styles.devHeader, pressed && styles.pressed]}>
        <View style={styles.texts}>
          <Text style={styles.rowTitle}>{texts.devTitle}</Text>
          <Text style={styles.hint}>{texts.devHint}</Text>
        </View>
        <View style={isOpen ? styles.chevronUp : undefined}>
          <SettingsIcon name="chevron" color={AppColors.text} />
        </View>
      </Pressable>
      {isOpen && (
        <>
          <OptionToggle title={strings.hostLobby.shortGame.title} hint={strings.hostLobby.shortGame.hint} value={isShortGame} onChange={onShortGame} />
          {isDraw && <OptionToggle title={texts.singleDrawerTitle} hint={texts.singleDrawerHint} value={isSingleDrawer} onChange={onSingleDrawer} />}
        </>
      )}
    </View>
  );
}

const ROUND_SIZE = 36;
const ICON_DISC = 44;

const styles = StyleSheet.create({
  entryRow: {
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
  entryText: {
    ...TEXT_FIT_SAFETY,
    flex: 1,
  },
  entryTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  entrySummary: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.lobbyPanel,
  },
  highlighted: {
    borderColor: AppColors.link,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  disabled: {
    opacity: 0.5,
  },
  iconDisc: {
    width: ICON_DISC,
    height: ICON_DISC,
    borderRadius: ICON_DISC / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  avatar: {
    fontSize: 24,
  },
  texts: {
    flex: 1,
    minWidth: 96,
    gap: 2,
  },
  rowTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  success: {
    color: AppColors.correct,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  link: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  rounds: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  roundChoice: {
    width: ROUND_SIZE,
    height: ROUND_SIZE,
    borderRadius: ROUND_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundSelected: {
    backgroundColor: AppColors.accent,
  },
  roundLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  roundLabelSelected: {
    color: AppColors.onAccent,
  },
  joinForm: {
    gap: Spacing.two,
  },
  nameInput: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.inkSurface,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 18,
  },
  joinButton: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.link,
    boxShadow: AppShadows.hard,
  },
  joinLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  devBlock: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
  },
});
