'use client';

import type { LogKind } from '@/lib/sdk-console';
import { useSdkConsole } from '@/lib/sdk-console';

const KIND_DOT: Record<LogKind, string> = {
  state: 'bg-sky-400',
  control: 'bg-emerald-400',
  event: 'bg-violet-400',
  error: 'bg-rose-400',
  info: 'bg-slate-400',
};

const KIND_TEXT: Record<LogKind, string> = {
  state: 'text-sky-300',
  control: 'text-emerald-300',
  event: 'text-violet-300',
  error: 'text-rose-300',
  info: 'text-slate-300',
};

const KIND_LABELS: Record<LogKind, string> = {
  state: 'estado',
  control: 'controle',
  event: 'evento',
  error: 'erro',
  info: 'info',
};

function formatTime(date: Date) {
  return `${date.toLocaleTimeString('pt-BR', { hour12: false })}.${date.getMilliseconds().toString().padStart(3, '0')}`;
}

export function SdkConsole() {
  const { entries, clear } = useSdkConsole();

  return (
    <aside className="panel flex h-[calc(100vh-8.5rem)] flex-col lg:sticky lg:top-[5.25rem]">
      <header className="flex items-start justify-between gap-3 border-b border-cx-line px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blip rounded-full bg-cx-teal" />
            <h2 className="text-sm font-semibold">Console do SDK</h2>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-cx-dim">
            Transições, comandos e eventos — mais recente no topo
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-md border border-cx-line px-2 py-1 text-[11px] text-cx-dim transition-colors hover:border-cx-line2 hover:text-cx-text"
        >
          Limpar
        </button>
      </header>

      <ol className="thin-scroll flex-1 divide-y divide-cx-line/60 overflow-y-auto">
        {entries.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-cx-dim">Aguardando atividade do SDK…</li>
        )}

        {entries.map((entry) => (
          <li key={entry.id} className="animate-slidein px-4 py-2.5 transition-colors hover:bg-cx-raised/50">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[entry.kind]}`} />
              <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${KIND_TEXT[entry.kind]}`}>
                {KIND_LABELS[entry.kind]}
              </span>
              <span className="tnum ml-auto font-mono text-[10px] text-cx-dim">{formatTime(entry.at)}</span>
            </div>
            <p className="mt-1.5 break-words pl-3.5 font-mono text-[11.5px] leading-relaxed text-cx-text">
              {entry.source}
            </p>
            {entry.detail && <p className="mt-0.5 pl-3.5 text-[11px] text-cx-dim">{entry.detail}</p>}
          </li>
        ))}
      </ol>
    </aside>
  );
}
