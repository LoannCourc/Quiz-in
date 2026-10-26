import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { openUpdateStore } from '@/lib/storeLinks';

const texts = strings.update;

export function storeFallbackText(): string {
  return Platform.OS === 'ios' ? texts.storeFallback.ios : texts.storeFallback.android;
}

interface UpdateSheetProps {
  isOpen: boolean;
  storeUrl: string;
  onClose: () => void;
  // Remplaçable par la démo (ouverture qui échoue).
  openStore?: (storeUrl: string) => Promise<boolean>;
}

// Popup doux de l'accueil (spec 21) : « Mettre à jour » ouvre la fiche du store, « Plus tard » ferme. Aucun
// lien ne s'ouvre : la feuille reste, avec le message de secours.
export function UpdateSheet({ isOpen, storeUrl, onClose, openStore = openUpdateStore }: UpdateSheetProps) {
  const [hasFailed, setHasFailed] = useState(false);
  async function update() {
    if (await openStore(storeUrl)) onClose();
    else setHasFailed(true);
  }
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={texts.title}
      footer={
        <View style={styles.footer}>
          <BigButton label={texts.update} onPress={() => void update()} />
          <BigButton label={texts.later} variant="secondary" size="compact" onPress={onClose} />
        </View>
      }>
      <Text style={textStyles.body}>{texts.text}</Text>
      {hasFailed && <Text style={textStyles.body}>{storeFallbackText()}</Text>}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.two,
  },
});
