'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type LogKind = 'state' | 'control' | 'event' | 'error' | 'info';

export interface LogEntry {
  id: number;
  at: Date;
  kind: LogKind;
  /** Hook ou método do SDK que originou a linha. Ex: `useCallOperatorControls().becomeAvailable()` */
  source: string;
  detail?: string;
}

interface SdkConsoleApi {
  entries: LogEntry[];
  log: (kind: LogKind, source: string, detail?: string) => void;
  clear: () => void;
}

const SdkConsoleContext = createContext<SdkConsoleApi | null>(null);

const MAX_ENTRIES = 200;

let nextId = 0;

/**
 * Registro em memória de tudo que o SDK expõe: transições de estado, chamadas de
 * controle e eventos. Existe só para tornar o comportamento do SDK observável
 * durante a demonstração — não faz parte da integração em si.
 */
export function SdkConsoleProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const log = useCallback((kind: LogKind, source: string, detail?: string) => {
    nextId += 1;
    const entry: LogEntry = { id: nextId, at: new Date(), kind, source, detail };

    setEntries((current) => [entry, ...current].slice(0, MAX_ENTRIES));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo(() => ({ entries, log, clear }), [entries, log, clear]);

  return <SdkConsoleContext.Provider value={value}>{children}</SdkConsoleContext.Provider>;
}

export function useSdkConsole(): SdkConsoleApi {
  const context = useContext(SdkConsoleContext);

  if (!context) {
    throw new Error('useSdkConsole precisa estar dentro de <SdkConsoleProvider>');
  }

  return context;
}
