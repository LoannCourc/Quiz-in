import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';

import { PlayerGame } from '@/components/player/game/PlayerGame';
import { JoinForm } from '@/components/player/JoinForm';
import { JoinHeader } from '@/components/player/JoinHeader';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { PlayerNotice } from '@/components/player/PlayerNotice';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { usePlayerSession, type PlayerSessionState } from '@/hooks/usePlayerSession';
import { useAnswer } from '@/hooks/useAnswer';
import { usePresence } from '@/hooks/usePresence';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { getEntryRefusal, rememberProfile } from '@/lib/joinGame';

// Adresse encodée dans le QR code de la TV : /join/CODE (spec 6.6).
export default function JoinRoomScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? '');

  // Code validé avant toute lecture dans la base.
  return isValidRoomCode(code) ? (
    <JoinRoom code={code} />
  ) : (
    <WelcomeScreen>
      <PlayerNotice message={strings.join.invalidCode} tone="error" showOtherCode />
    </WelcomeScreen>
  );
}

// Écrans d'accueil (avant la partie) : fond, logo et code. Pendant la partie, PlayerGame
// occupe tout l'écran.
interface WelcomeScreenProps {
  code?: string;
  children: ReactNode;
  footer?: ReactNode;
}

function WelcomeScreen({ code, children, footer }: WelcomeScreenProps) {
  return (
    <Screen footer={footer}>
      <JoinHeader code={code} />
      {children}
    </Screen>
  );
}

function isRegistered(state: PlayerSessionState): boolean {
  return state.kind === 'ready' && state.players[state.uid] !== undefined;
}

function JoinRoom({ code }: { code: string }) {
  const state = usePlayerSession(code);
  const registered = isRegistered(state);
  usePresence(code, registered && state.kind === 'ready' ? state.uid : null);

  switch (state.kind) {
    case 'loading':
      return <WelcomeScreen code={code}><PlayerNotice message={strings.join.loading} /></WelcomeScreen>;
    case 'error':
      // Le détail technique est dans la console (usePlayerSession).
      return <WelcomeScreen code={code}><PlayerNotice message={strings.join.joinFailed} tone="error" /></WelcomeScreen>;
    case 'notFound':
      return (
        <WelcomeScreen code={code}>
          <PlayerNotice message={strings.join.refusals.notFound} tone="error" showOtherCode />
        </WelcomeScreen>
      );
  }

  // Reprise : même session anonyme (même navigateur) = même uid, donc on retrouve son entrée.
  if (registered) {
    return <RegisteredPlayer code={code} state={state} />;
  }

  const refusal = getEntryRefusal(state.status, state.players, state.uid);
  return (
    <WelcomeScreen code={code}>
      {refusal ? (
        <PlayerNotice message={strings.join.refusals[refusal]} tone="error" showOtherCode />
      ) : (
        <JoinForm code={code} uid={state.uid} status={state.status} players={state.players} />
      )}
    </WelcomeScreen>
  );
}

interface RegisteredPlayerProps {
  code: string;
  state: Extract<PlayerSessionState, { kind: 'ready' }>;
}

// Joueur déjà inscrit : lobby, modification du profil, ou partie en cours.
function RegisteredPlayer({ code, state }: RegisteredPlayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const serverOffsetMs = useServerTimeOffset();
  const { uid, status, players } = state;
  const { answer, onAnswer } = useAnswer(code, uid, state.session);
  const me = players[uid];
  // Mémorisé pour préremplir la réinscription si l'hôte retire ce joueur du lobby (fantôme).
  useEffect(() => {
    rememberProfile(code, me.name, me.avatar);
  }, [code, me.name, me.avatar]);

  if (status !== 'lobby') {
    // Partie lancée pendant la modification : le formulaire disparaît (les règles refuseraient
    // l'écriture) et on rappelle le profil réellement enregistré.
    return (
      <PlayerGame
        session={state.session}
        uid={uid}
        serverOffsetMs={serverOffsetMs}
        answer={answer}
        onAnswer={onAnswer}
        notice={isEditing ? strings.profile.editInterrupted(me.avatar, me.name) : undefined}
      />
    );
  }

  if (isEditing) {
    return (
      <WelcomeScreen code={code}>
        <JoinForm code={code} uid={uid} status={status} players={players} edit={{ onDone: () => setIsEditing(false) }} />
      </WelcomeScreen>
    );
  }
  return (
    <WelcomeScreen
      code={code}
      footer={<BigButton label={strings.profile.editButton} variant="secondary" onPress={() => setIsEditing(true)} />}>
      <PlayerLobby uid={uid} players={players} />
    </WelcomeScreen>
  );
}
