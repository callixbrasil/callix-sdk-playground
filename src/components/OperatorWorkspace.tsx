'use client';

import { useCallOperator, useCallOperatorEventListener, useCallOperatorState } from '@callixbrasil/client-sdk-react';
import { useEffect, useRef } from 'react';

import { AfterCallPanel } from './AfterCallPanel';
import { CallPanel } from './CallPanel';
import { Dialer } from './Dialer';
import { StatusControls } from './StatusControls';
import { useSdkConsole } from '@/lib/sdk-console';
import { useSignal } from '@/lib/use-signal';

const STATE_LABELS: Record<string, string> = {
  starting: 'Iniciando',
  idle: 'Disponível',
  offline: 'Offline',
  onBreak: 'Em pausa',
  callRinging: 'Chamada tocando',
  manualCallSetup: 'Discando',
  manualCallRinging: 'Tocando',
  callInProgress: 'Em chamada',
  afterCall: 'Pós-atendimento',
  error: 'Erro',
};

/** cor semântica por estado: [texto, fundo, ponto] */
const STATE_TONE: Record<string, string> = {
  starting: 'text-sky-300 bg-sky-400/10 ring-sky-400/25',
  idle: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/25',
  offline: 'text-slate-300 bg-slate-400/10 ring-slate-400/20',
  onBreak: 'text-amber-300 bg-amber-400/10 ring-amber-400/25',
  callRinging: 'text-cx-teal bg-cx-teal/10 ring-cx-teal/30',
  manualCallSetup: 'text-cx-teal bg-cx-teal/10 ring-cx-teal/30',
  manualCallRinging: 'text-cx-teal bg-cx-teal/10 ring-cx-teal/30',
  callInProgress: 'text-cx-teal bg-cx-teal/10 ring-cx-teal/30',
  afterCall: 'text-violet-300 bg-violet-400/10 ring-violet-400/25',
  error: 'text-rose-300 bg-rose-400/10 ring-rose-400/25',
};

const DOT_TONE: Record<string, string> = {
  starting: 'bg-sky-400',
  idle: 'bg-emerald-400',
  offline: 'bg-slate-400',
  onBreak: 'bg-amber-400',
  callRinging: 'bg-cx-teal',
  manualCallSetup: 'bg-cx-teal',
  manualCallRinging: 'bg-cx-teal',
  callInProgress: 'bg-cx-teal',
  afterCall: 'bg-violet-400',
  error: 'bg-rose-400',
};

const LIVE_STATES = ['starting', 'callRinging', 'manualCallSetup', 'manualCallRinging'];

export function OperatorWorkspace() {
  const operatorState = useCallOperatorState();
  const state = operatorState?.state ?? 'starting';

  const operator = useCallOperator();
  const tenant = useSignal(operator.tenant);
  const stateKeys = useSignal(operator.currentStateKeys);

  const { log } = useSdkConsole();

  // Toda transição da máquina de estados vira uma linha no console.
  const previousState = useRef<string | null>(null);
  useEffect(() => {
    if (previousState.current === state) return;

    log('state', `useCallOperatorState() → ${state}`, previousState.current ? `de "${previousState.current}"` : 'inicial');
    previousState.current = state;
  }, [state, log]);

  // Único evento público do CallOperator hoje: a sessão foi derrubada.
  useCallOperatorEventListener('userSessionDropped', (data) => {
    log('event', 'userSessionDropped', `originator=${data.originator} sessionId=${data.sessionId ?? '—'}`);
  });

  const tone = STATE_TONE[state] ?? STATE_TONE.offline;
  const dot = DOT_TONE[state] ?? DOT_TONE.offline;

  return (
    <section className="space-y-5">
      {/* cabeçalho de estado */}
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="relative grid h-11 w-11 place-items-center">
              {LIVE_STATES.includes(state) && (
                <span className={`absolute inset-0 animate-ring rounded-full ${dot} opacity-40`} />
              )}
              <span className={`relative h-3 w-3 rounded-full ${dot} ${state === 'idle' ? 'animate-blip' : ''}`} />
            </span>

            <div>
              <p className="label">Estado do operador</p>
              <p className="mt-0.5 text-xl font-semibold tracking-tight">{STATE_LABELS[state] ?? state}</p>
            </div>
          </div>

          <span className={`rounded-full px-3 py-1 font-mono text-xs ring-1 ${tone}`}>{state}</span>
        </div>

        <dl className="grid grid-cols-1 gap-px border-t border-cx-line bg-cx-line sm:grid-cols-2">
          <div className="bg-cx-panel px-5 py-3">
            <dt className="label">Tenant</dt>
            <dd className="mt-1 text-sm">{tenant ? `${tenant.name} · ${tenant.subdomain}` : '—'}</dd>
          </div>
          <div className="bg-cx-panel px-5 py-3">
            <dt className="label">Máquina de estados</dt>
            <dd className="mt-1 font-mono text-xs text-cx-muted">{stateKeys.length > 0 ? stateKeys.join(' · ') : '—'}</dd>
          </div>
        </dl>
      </div>

      <StatusControls />

      {(state === 'idle' || state === 'onBreak') && <Dialer disabled={state !== 'idle'} />}

      {operatorState &&
        (operatorState.state === 'callRinging' ||
          operatorState.state === 'manualCallSetup' ||
          operatorState.state === 'manualCallRinging' ||
          operatorState.state === 'callInProgress') && (
          <CallPanel state={operatorState.state} call={operatorState.call} />
        )}

      {state === 'afterCall' && <AfterCallPanel />}

      {state === 'error' && (
        <div className="panel border-rose-500/30 p-5">
          <p className="label mb-2 text-rose-400/80">Erro</p>
          <p className="text-sm text-cx-muted">
            O operador entrou em estado de erro. Verifique o token de sessão e as permissões do usuário.
          </p>
        </div>
      )}
    </section>
  );
}
