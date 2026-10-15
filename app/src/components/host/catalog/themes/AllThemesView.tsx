import type { ThemeStats } from '@shared/themeCatalog';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { ThemeSheet } from './ThemeSheet';
import { ThemeTile } from './ThemeTile';

interface AllThemesViewProps {
  themes: ThemeStats[];
  onBack: () => void;
  // CONTINUER de la feuille d'un thème : fiche de la partie tirée dans les thèmes choisis.
  onPlay: (themes: string[], questionCount: number) => void;
}

const COLUMNS = 2;

// « Tout voir » du rail des thèmes (maquette QN1-A) : tous les thèmes du Quiz en grille de deux colonnes ;
// une tuile ouvre la feuille du thème, comme dans le catalogue.
export function AllThemesView({ themes, onBack, onPlay }: AllThemesViewProps) {
  const [columnWidth, setColumnWidth] = useState(0);
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const tileWidth = Math.floor((columnWidth - (COLUMNS - 1) * Spacing.three) / COLUMNS);
  return (
    <Screen>
      <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
        <View style={styles.header}>
          <BackButton onPress={onBack} label={strings.home.back} />
          <Text style={styles.title}>{strings.catalog.themesHome.allThemes}</Text>
        </View>
        {columnWidth > 0 && (
          <View style={styles.grid}>
            {themes.map((theme) => (
              <ThemeTile key={theme.theme} theme={theme} width={tileWidth} onPress={() => setOpenTheme(theme.theme)} />
            ))}
          </View>
        )}
      </View>
      <ThemeSheet
        theme={openTheme}
        themes={themes}
        onClose={() => setOpenTheme(null)}
        onContinue={(chosen, questionCount) => {
          setOpenTheme(null);
          onPlay(chosen, questionCount);
        }}
      />
    </Screen>
  );
}

const TITLE_SIZE = 20;

const styles = StyleSheet.create({
  column: {
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 48,
  },
  title: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
