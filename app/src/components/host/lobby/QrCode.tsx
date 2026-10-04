import qrcode from 'qrcode-generator';
import { useMemo } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';

interface DarkRun {
  row: number;
  col: number;
  length: number;
}

// Modules sombres du QR code, regroupés en segments horizontaux (un View par segment).
// Correction d'erreur M : bon compromis entre robustesse et taille des modules.
function darkRuns(text: string): { count: number; runs: DarkRun[] } {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const runs: DarkRun[] = [];
  for (let row = 0; row < count; row += 1) {
    let col = 0;
    while (col < count) {
      if (!qr.isDark(row, col)) {
        col += 1;
        continue;
      }
      const start = col;
      while (col < count && qr.isDark(row, col)) col += 1;
      runs.push({ row, col: start, length: col - start });
    }
  }
  return { count, runs };
}

// Taille d'un module : un nombre entier de pixels physiques (pas de fines lignes entre les rangées),
// pour que le QR avec sa marge tienne dans AppSizes.qrSize.
function moduleSizeFor(totalModules: number): number {
  const ratio = PixelRatio.get();
  return Math.floor((AppSizes.qrSize * ratio) / totalModules) / ratio;
}

interface QrCodeProps {
  value: string;
  accessibilityLabel: string;
}

// QR code encre sur fond blanc, avec sa marge blanche (quiet zone) de AppSizes.qrQuietZone modules.
export function QrCode({ value, accessibilityLabel }: QrCodeProps) {
  const { count, runs } = useMemo(() => darkRuns(value), [value]);
  const quiet = AppSizes.qrQuietZone;
  const size = moduleSizeFor(count + 2 * quiet);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.background, { width: size * (count + 2 * quiet), height: size * (count + 2 * quiet) }]}>
      {runs.map(({ row, col, length }) => (
        <View
          key={`${row}-${col}`}
          style={[
            styles.module,
            { top: (row + quiet) * size, left: (col + quiet) * size, width: length * size, height: size },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    borderRadius: 10,
    backgroundColor: AppColors.qrBackground,
  },
  module: {
    position: 'absolute',
    backgroundColor: AppColors.qrModule,
  },
});
