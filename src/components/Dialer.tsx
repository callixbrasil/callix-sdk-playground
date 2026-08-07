'use client';

import { useCallOperatorControls } from '@callixbrasil/client-sdk-react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useState } from 'react';

import { BackspaceIcon, PhoneIcon } from './icons';
import { useSdkConsole } from '@/lib/sdk-console';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const KEY_LETTERS: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

export function Dialer({ disabled }: { disabled: boolean }) {
  const { makeManualCall } = useCallOperatorControls();
  const { log } = useSdkConsole();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const trimmed = phoneNumber.trim();
  const isValid = trimmed.length > 0 && isValidPhoneNumber(trimmed, 'BR');

  function press(key: string) {
    setPhoneNumber((current) => current + key);
    if (error) setError(null);
  }

  function handleCall() {
    if (!isValid) {
      setError('Número inválido. Use +5511999999999 ou 11999999999.');
      return;
    }

    setError(null);

    try {
      log('control', `makeManualCall("${trimmed}")`);
      makeManualCall(trimmed);
      setPhoneNumber('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao iniciar a chamada';
      log('error', 'makeManualCall()', message);
      setError(message);
    }
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="label">Chamada manual</p>
        {disabled && <span className="text-xs text-cx-dim">saia da pausa para discar</span>}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col justify-center">
          <div className="relative">
            <input
              id="dialer-number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+55 11 99999 9999"
              value={phoneNumber}
              disabled={disabled}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCall();
                }
              }}
              className="tnum h-14 w-full rounded-xl border border-cx-line bg-cx-raised pl-4 pr-12 font-mono text-xl tracking-wide text-cx-text transition-colors placeholder:text-cx-dim/60 hover:border-cx-line2 focus:border-cx-teal/50 disabled:opacity-50"
            />
            {phoneNumber && !disabled && (
              <button
                type="button"
                onClick={() => setPhoneNumber((c) => c.slice(0, -1))}
                aria-label="Apagar último dígito"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-cx-dim transition-colors hover:bg-cx-line hover:text-cx-text"
              >
                <BackspaceIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <p className="mb-3 mt-2 min-h-[1rem] text-xs text-rose-400">{error}</p>

          <button
            type="button"
            onClick={handleCall}
            disabled={disabled || !isValid}
            className={`inline-flex h-12 items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all ${
              disabled || !isValid
                ? 'cursor-not-allowed bg-cx-raised/60 text-cx-dim/60 ring-1 ring-cx-line'
                : 'bg-cx-teal text-cx-bg shadow-glow hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            <PhoneIcon className="h-4 w-4" />
            Discar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => press(key)}
              className="group flex h-14 w-16 flex-col items-center justify-center rounded-lg border border-cx-line bg-cx-raised transition-all hover:border-cx-line2 hover:bg-cx-line active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="font-mono text-lg leading-none text-cx-text">{key}</span>
              {KEY_LETTERS[key] && (
                <span className="mt-0.5 font-mono text-[8px] tracking-[0.14em] text-cx-dim">{KEY_LETTERS[key]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
