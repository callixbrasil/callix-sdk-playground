'use client';

import type { ReadableSignal } from '@callixbrasil/client-sdk';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Lê qualquer signal exposto pelo CallOperator (`user`, `tenant`, `currentBreakId`,
 * `currentStateKeys`, ...) como estado do React.
 *
 * O pacote `client-sdk-react` já cobre os casos comuns com hooks prontos; este hook
 * serve para o que ainda não tem hook dedicado, sem precisar cair em useEffect.
 */
export function useSignal<T>(signal: ReadableSignal<T>): T {
  const subscribe = useCallback((onChange: () => void) => signal.subscribe(() => onChange()), [signal]);
  const getSnapshot = useCallback(() => signal.get(), [signal]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
