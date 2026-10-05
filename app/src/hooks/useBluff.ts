import type { BluffCheck, BluffEntry, PlayerId, PublicSession } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { submitBluff, submitVote, type BluffSendState, type BluffVoteState, type PlayerBluff } from '@/lib/playerBluff';

// Ce qui est propre au joueur, lu à la question en cours (lui seul peut le lire).
interface OwnNodes {
  index: number;
  entry: BluffEntry | null;
  check: BluffCheck | null;
  ownChoice: number | null;
}

interface LocalState<T> {
  index: number;
  state: T;
}

const IDLE_SEND: BluffSendState = { kind: 'idle' };
const IDLE_VOTE: BluffVoteState = { kind: 'idle' };

// Bluff (spec 16) : la proposition du joueur, le verdict de l'hôte, sa place parmi les choix du vote,
// et ses actions (écrire, voter). null hors d'une partie de Bluff.
export function useBluff(code: string, uid: PlayerId, session: PublicSession): PlayerBluff | null {
  const isBluff = session.settings.answerMode === 'bluff';
  const index = session.currentIndex;
  const [own, setOwn] = useState<OwnNodes>({ index: -1, entry: null, check: null, ownChoice: null });
  const [send, setSend] = useState<LocalState<BluffSendState>>({ index: -1, state: IDLE_SEND });
  const [vote, setVote] = useState<LocalState<BluffVoteState>>({ index: -1, state: IDLE_VOTE });

  useEffect(() => {
    if (!isBluff) return;
    const base = `sessions/${code}`;
    const unsubscribers = [
      onValue(ref(db, `${base}/bluffs/${index}/${uid}`), (snapshot) =>
        setOwn((current) => ({ ...reset(current, index), entry: (snapshot.val() as BluffEntry | null) ?? null })),
      ),
      onValue(ref(db, `${base}/bluffChecks/${index}/${uid}`), (snapshot) =>
        setOwn((current) => ({ ...reset(current, index), check: (snapshot.val() as BluffCheck | null) ?? null })),
      ),
      onValue(ref(db, `${base}/bluffOwn/${index}/${uid}`), (snapshot) => {
        const value: unknown = snapshot.val();
        setOwn((current) => ({ ...reset(current, index), ownChoice: typeof value === 'number' ? value : null }));
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [isBluff, code, uid, index]);

  if (!isBluff) return null;
  const current = own.index === index ? own : { index, entry: null, check: null, ownChoice: null };
  const sendState = send.index === index ? send.state : IDLE_SEND;
  // La base fait foi : votedBy dit qu'on a voté, même après un rechargement.
  const hasVoted = session.votedBy?.[index]?.[uid] === true;
  const localVote = vote.index === index ? vote.state : IDLE_VOTE;
  const voteState: BluffVoteState = hasVoted && localVote.kind !== 'sent' ? { kind: 'sent', choice: votedChoice(localVote) } : localVote;

  function onSubmit(text: string) {
    if (sendState.kind === 'sending') return;
    setSend({ index, state: { kind: 'sending', text } });
    submitBluff(code, uid, index, text).then((outcome) =>
      // Envoyée : le verdict de l'hôte arrive dans bluffChecks ; sinon, on garde le texte pour réessayer.
      setSend({ index, state: outcome === 'sent' ? IDLE_SEND : { kind: 'failed', text } }),
    );
  }

  function onVote(choice: number) {
    if (voteState.kind === 'sending' || voteState.kind === 'sent') return;
    setVote({ index, state: { kind: 'sending', choice } });
    submitVote(code, uid, index, choice).then((outcome) =>
      setVote({ index, state: outcome === 'sent' ? { kind: 'sent', choice } : { kind: 'refused', choice, reason: outcome } }),
    );
  }

  return { entry: current.entry, check: current.check, ownChoice: current.ownChoice, send: sendState, vote: voteState, onSubmit, onVote };
}

// Valeurs d'une autre question : on repart de zéro.
function reset(current: OwnNodes, index: number): OwnNodes {
  return current.index === index ? current : { index, entry: null, check: null, ownChoice: null };
}

function votedChoice(local: BluffVoteState): number | null {
  return local.kind === 'sending' || local.kind === 'refused' ? local.choice : null;
}
