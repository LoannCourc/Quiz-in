import { router } from 'expo-router';
import { Text } from 'react-native';

import { strings } from '@/constants/strings';

import { BigButton } from './BigButton';
import { playerTextStyles } from './playerTextStyles';

interface PlayerNoticeProps {
  message: string;
  tone?: 'info' | 'error';
  // Propose de revenir à la saisie du code (refus, code invalide).
  showOtherCode?: boolean;
}

export function PlayerNotice({ message, tone = 'info', showOtherCode = false }: PlayerNoticeProps) {
  return (
    <>
      <Text style={tone === 'error' ? playerTextStyles.error : playerTextStyles.body}>{message}</Text>
      {showOtherCode && (
        <BigButton
          label={strings.join.otherCodeButton}
          variant="secondary"
          onPress={() => router.replace('/join')}
        />
      )}
    </>
  );
}
