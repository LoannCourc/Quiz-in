import { abandonedGameDeletableAt, isHostAway } from '@shared/hostAbsence';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import type { TeamId } from '@shared/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';

import { PlayerGame } from '@/components/player/game/PlayerGame';
import { JoinForm } from '@/components/player/JoinForm';
import { HostAwayNotice, WaitingHostNotice } from '@/components/player/HostAwayNotice';
import { JoinHeader } from '@/components/player/JoinHeader';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { PlayerNotice } from '@/components/player/PlayerNotice';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { usePlayerSession, type PlayerSessionState } from '@/hooks/usePlayerSession';
import { useAbandonedGameCleanup } from '@/hooks/useAbandonedGameCleanup';
import { useAnswer } from '@/hooks/useAnswer';
import { useBluff } from '@/hooks/useBluff';
import { useDraw } from '@/hooks/useDraw';
import { usePhaseStale } from '@/hooks/usePhaseStale';
import { usePresence } from '@/hooks/usePresence';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { chooseTeam, getEntryRefusal, rememberProfile } from '@/lib/joinGame';

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
  const serverOffsetMs = useServerTimeOffset();
  // Hôte parti depuis plus de 5 min : ce téléphone supprime la partie (nettoyage, spec 6.6).
  useAbandonedGameCleanup(code, state.kind === 'ready' ? state.session : null, serverOffsetMs);

  switch (state.kind) {
    case 'loading':
      return <WelcomeScreen code={code}><PlayerNotice message={strings.join.loading} /></WelcomeScreen>;
    case 'error':
      // Le détail technique est dans la console (usePlayerSession).
      return <WelcomeScreen code={code}><PlayerNotice message={strings.join.joinFailed} tone="error" /></WelcomeScreen>;
    case 'notFound':
      return (
        <WelcomeScreen code={code}>
          <PlayerNotice
            message={state.wasRemoved ? strings.join.gameOver : strings.join.refusals.notFound}
            tone={state.wasRemoved ? 'info' : 'error'}
            showOtherCode
          />
        </WelcomeScreen>
      );
  }

  // Reprise : même session anonyme (même navigateur) = même uid, donc on retrouve son entrée.
  if (registered) {
    return <RegisteredPlayer code={code} state={state} serverOffsetMs={serverOffsetMs} />;
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
  serverOffsetMs: number;
}

// Joueur déjà inscrit : lobby, modification du profil, ou partie en cours.
function RegisteredPlayer({ code, state, serverOffsetMs }: RegisteredPlayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const { uid, status, players } = state;
  const { answer, onAnswer } = useAnswer(code, uid, state.session);
  const bluff = useBluff(code, uid, state.session);
  const draw = useDraw(code, uid, state.session);
  const me = players[uid];
  const isPhaseStale = usePhaseStale(state.session, serverOffsetMs);

  // Groupe, mode « Ils choisissent » : choix de l'équipe (refusé par les règles hors du lobby).
  async function choose(team: TeamId) {
    setTeamError(null);
    try {
      await chooseTeam(code, uid, team);
    } catch (error) {
      console.warn('[teams] Choix de l’équipe refusé', error);
      setTeamError(strings.teams.picker.chooseFailed);
    }
  }
  // Mémorisé pour préremplir la réinscription si l'hôte retire ce joueur du lobby (fantôme).
  useEffect(() => {
    rememberProfile(code, me.name, me.avatar);
  }, [code, me.name, me.avatar]);

  // Hôte absent (coupure) : un seul message, avec le temps avant suppression ; pas en fin de partie.
  const deletableAt = abandonedGameDeletableAt(state.session);
  if (isHostAway(state.session) && deletableAt !== null) {
    return (
      <WelcomeScreen code={code}>
        <HostAwayNotice deletableAt={deletableAt} serverOffsetMs={serverOffsetMs} />
      </WelcomeScreen>
    );
  }

  // Phase figée depuis plus de 5 s (coupure de l'hôte pas encore connue du serveur) : à la place
  // du chrono bloqué.
  if (isPhaseStale) {
    return (
      <WelcomeScreen code={code}>
        <WaitingHostNotice />
      </WelcomeScreen>
    );
  }

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
        bluff={bluff}
        draw={draw}
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
      <PlayerLobby
        uid={uid}
        players={players}
        teams={
          state.session.settings.teams
            ? { settings: state.session.settings, onChoose: (team) => void choose(team), error: teamError }
            : undefined
        }
      />
    </WelcomeScreen>
  );
}
