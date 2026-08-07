'use client';

import {
  useCallOperatorBreaks,
  useCallOperatorControls,
  useCallOperatorCurrentBreak,
  useCallOperatorState,
} from '@callixbrasil/client-sdk-react';
import { useState } from 'react';

import { CheckIcon, CoffeeIcon, PowerIcon } from './icons';
import { useSdkConsole } from '@/lib/sdk-console';

/** Estados em que cada comando é aceito pela máquina de estados do operador. */
const ACCEPTS_BECOME_AVAILABLE = ['offline', 'onBreak', 'error'];
const ACCEPTS_ENTER_ON_BREAK = ['idle', 'offline'];

export function StatusControls() {
  const { becomeAvailable, goOffline, enterOnBreak } = useCallOperatorControls();
  const breaks = useCallOperatorBreaks();
  const currentBreak = useCallOperatorCurrentBreak();
  const operatorState = useCallOperatorState();
  const { log } = useSdkConsole();

  const [selectedBreakId, setSelectedBreakId] = useState<number | null>(null);

  const state = operatorState?.state ?? 'starting';
  const breakId = selectedBreakId ?? breaks[0]?.id ?? null;

  const canBecomeAvailable = ACCEPTS_BECOME_AVAILABLE.includes(state);
  const canEnterOnBreak = ACCEPTS_ENTER_ON_BREAK.includes(state) && breakId != null;
  const canGoOffline = state !== 'offline' && state !== 'starting';

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label">Disponibilidade</p>
        {currentBreak && (
          <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-300 ring-1 ring-amber-400/25">
            {currentBreak.name}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <Action
          label="Ficar disponível"
          icon={<CheckIcon className="h-4 w-4" />}
          tone="ok"
          disabled={!canBecomeAvailable}
          hint={canBecomeAvailable ? undefined : `becomeAvailable() é ignorado em "${state}"`}
          onClick={() => {
            log('control', 'becomeAvailable()');
            becomeAvailable();
          }}
        />

        <Action
          label="Ficar offline"
          icon={<PowerIcon className="h-4 w-4" />}
          tone="neutral"
          disabled={!canGoOffline}
          hint={canGoOffline ? undefined : 'Já está offline'}
          onClick={() => {
            log('control', 'goOffline()');
            goOffline();
          }}
        />

        <div className="ml-auto flex items-end gap-2">
          <div>
            <label htmlFor="break-select" className="label mb-1.5 block">
              Pausa
            </label>
            <select
              id="break-select"
              value={breakId ?? ''}
              disabled={breaks.length === 0}
              onChange={(e) => setSelectedBreakId(Number(e.target.value))}
              className="h-9 rounded-lg border border-cx-line bg-cx-raised px-3 text-sm text-cx-text transition-colors hover:border-cx-line2 disabled:opacity-50"
            >
              {breaks.length === 0 && <option value="">Nenhuma pausa configurada</option>}
              {breaks.map((serviceBreak) => (
                <option key={serviceBreak.id} value={serviceBreak.id}>
                  {serviceBreak.name}
                </option>
              ))}
            </select>
          </div>

          <Action
            label="Entrar em pausa"
            icon={<CoffeeIcon className="h-4 w-4" />}
            tone="warn"
            disabled={!canEnterOnBreak}
            hint={canEnterOnBreak ? undefined : `enterOnBreak() é ignorado em "${state}"`}
            onClick={() => {
              if (breakId == null) return;
              log('control', `enterOnBreak(${breakId})`);
              enterOnBreak(breakId);
            }}
          />
        </div>
      </div>

      <p className="mt-4 border-t border-cx-line pt-3 text-xs leading-relaxed text-cx-dim">
        Comandos são intenções assíncronas e sem retorno. Quem confirma é a transição em{' '}
        <code className="font-mono text-cx-muted">useCallOperatorState()</code>.
      </p>
    </div>
  );
}

const TONES: Record<string, string> = {
  ok: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 hover:bg-emerald-500/25',
  warn: 'bg-amber-500/15 text-amber-300 ring-amber-400/25 hover:bg-amber-500/25',
  neutral: 'bg-cx-raised text-cx-muted ring-cx-line2 hover:bg-cx-line hover:text-cx-text',
};

function Action(props: {
  label: string;
  icon: React.ReactNode;
  tone: 'ok' | 'warn' | 'neutral';
  disabled: boolean;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.hint}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium ring-1 transition-all ${
        props.disabled
          ? 'cursor-not-allowed bg-cx-raised/60 text-cx-dim/60 ring-cx-line'
          : `${TONES[props.tone]} active:scale-[0.98]`
      }`}
    >
      {props.icon}
      {props.label}
    </button>
  );
}
