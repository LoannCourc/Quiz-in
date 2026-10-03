import { Alert, Platform } from 'react-native';

interface ConfirmTexts {
  title: string;
  message: string;
  confirm: string;
  cancel: string;
}

// Demande de confirmation ; onConfirm n'est appelé que si l'utilisateur accepte.
// Android : alerte native. Web : Alert.alert ne fait rien (react-native-web), donc boîte de
// confirmation du navigateur.
export function confirmAction({ title, message, confirm, cancel }: ConfirmTexts, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title} ${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: confirm, style: 'destructive', onPress: onConfirm },
  ]);
}
