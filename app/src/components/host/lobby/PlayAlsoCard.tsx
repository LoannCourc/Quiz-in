import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface PlayAlsoCardProps {
  // Profil de l'hôte dans la partie ; absent : il ne joue pas.
  player?: { name: string; avatar: string };
  onToggle: (isOn: boolean) => void;
  onEdit: () => void;
  isBusy?: boolean;
}

const texts = strings.hostLobby.playAlso;
// Pastille sombre quand l'option est activée : thumbColor suffit sur iOS et Android ; le web (démos, site)
// prend activeThumbColor (vert sinon), propriété de react-native-web absente des types de React Native.
const WEB_ACTIVE_THUMB: object = Platform.OS === 'web' ? { activeThumbColor: AppColors.ink } : {};

// « Je joue aussi » (maquette « Salon · Je joue aussi bien visible ») : carte au-dessus de « Réglages »,
// interrupteur à droite, bordure jaune quand l'hôte joue ; « Tu joues en tant que 🦊 Loann · Modifier ».
export function PlayAlsoCard({ player, onToggle, onEdit, isBusy = false }: PlayAlsoCardProps) {
  const isOn = player !== undefined;
  return (
    <View style={[styles.card, isOn && styles.cardOn]}>
      {/* Hôte qui joue : tout le texte ouvre « Modifier » (zone de toucher bien plus grande que le mot). */}
      <Pressable
        accessibilityRole={isOn ? 'button' : 'none'}
        accessibilityLabel={isOn ? texts.editLabel : undefined}
        disabled={!isOn}
        onPress={onEdit}
        style={styles.texts}>
        <Text style={styles.title}>{texts.title}</Text>
        {player ? (
          <Text style={styles.hint}>
            {`${texts.playingAs(player.avatar, player.name)} · `}
            <Text style={styles.edit}>{texts.edit}</Text>
          </Text>
        ) : (
          <Text style={styles.hint}>{texts.hint}</Text>
        )}
      </Pressable>
      <View style={styles.switchBox}>
        <Switch
          accessibilityLabel={texts.title}
          value={isOn}
          onValueChange={onToggle}
          disabled={isBusy}
          trackColor={{ true: AppColors.accent, false: AppColors.inkSurface }}
          thumbColor={isOn ? AppColors.ink : AppColors.text}
          ios_backgroundColor={AppColors.inkSurface}
          {...WEB_ACTIVE_THUMB}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 64,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.lobbyPanel,
    backgroundColor: AppColors.lobbyPanel,
  },
  cardOn: {
    borderColor: AppColors.accent,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  edit: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    textDecorationLine: 'underline',
  },
  switchBox: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
