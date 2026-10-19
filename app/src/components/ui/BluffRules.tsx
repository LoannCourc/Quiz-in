import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { loadBluffRulesSeen, saveBluffRulesSeen } from '@/lib/bluffRulesSeen';

const texts = strings.bluffRules;

// Les six règles du Bluff, numérotées (spec 16).
export function BluffRulesList() {
  return (
    <View style={styles.list}>
      {texts.lines.map((line, index) => (
        <View key={line} style={styles.line}>
          <Text style={styles.number}>{index + 1}.</Text>
          <Text style={styles.text}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

// Lien discret « Comment jouer ? » (zone de toucher de 44 au moins).
export function BluffRulesLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.linkButton}>
      <Text style={styles.link}>{texts.link}</Text>
    </Pressable>
  );
}

// Feuille « Comment jouer au Bluff » de l'hôte (catalogue du Bluff, fiche de la partie).
export function BluffRulesSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={texts.title}
      footer={
        <Pressable accessibilityRole="button" hitSlop={Spacing.three} onPress={onClose} style={styles.closeButton}>
          <Text style={styles.close}>{texts.close}</Text>
        </Pressable>
      }>
      <BluffRulesList />
    </BottomSheet>
  );
}

// Carte « Comment jouer au Bluff » du salon d'attente des joueurs : ouverte la première fois sur ce téléphone
// (aussitôt notée comme vue), sinon repliée en une ligne « Comment jouer ? » qui la rouvre. `initiallyOpen`
// impose l'état de départ (démos).
export function BluffRulesCard({ initiallyOpen }: { initiallyOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState<boolean | null>(initiallyOpen ?? null);

  useEffect(() => {
    if (initiallyOpen !== undefined) return;
    let isActive = true;
    void loadBluffRulesSeen().then((seen) => {
      if (!isActive) return;
      setIsOpen(!seen);
      if (!seen) void saveBluffRulesSeen();
    });
    return () => {
      isActive = false;
    };
  }, [initiallyOpen]);

  // Lecture en cours : rien plutôt qu'une carte qui se replierait aussitôt.
  if (isOpen === null) return null;
  if (!isOpen) {
    return (
      <View style={styles.collapsed}>
        <BluffRulesLink onPress={() => setIsOpen(true)} />
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{texts.title}</Text>
      <BluffRulesList />
      <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => setIsOpen(false)} style={styles.closeButton}>
        <Text style={styles.close}>{texts.hide}</Text>
      </Pressable>
    </View>
  );
}

const CARD_TITLE_SIZE = 18;

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.link,
    backgroundColor: AppColors.panel,
  },
  cardTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: CARD_TITLE_SIZE,
    lineHeight: Math.round(CARD_TITLE_SIZE * DISPLAY_LINE_HEIGHT),
  },
  collapsed: {
    alignItems: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  line: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  number: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  text: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 16,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  closeButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  close: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
