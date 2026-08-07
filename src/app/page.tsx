'use client';

import { CallixClientProvider } from '@callixbrasil/client-sdk-react';
import { useEffect, useState } from 'react';

import { OperatorWorkspace } from '@/components/OperatorWorkspace';
import { SdkConsole } from '@/components/SdkConsole';
import { SetupGuide } from '@/components/SetupGuide';
import { SdkConsoleProvider } from '@/lib/sdk-console';

interface SessionResponse {
  userSessionToken: string;
  user: { id: number; login: string; name: string; sessionId: number };
  domain: string;
}

interface SessionError {
  code?: 'setup_required' | 'credentials_rejected' | 'callix_unreachable';
  missing?: string[];
  error: string;
}

export default function Home() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [failure, setFailure] = useState<SessionError | null>(null);

  // A sessão é criada no servidor (server-sdk) e só o token chega ao browser.
  // Só montamos o provider depois disso, o que também evita rodar o SDK no SSR.
  useEffect(() => {
    let cancelled = false;

    fetch('/api/user-sdk-session', { method: 'POST' })
      .then(async (response) => {
        const body = (await response.json()) as SessionResponse & SessionError;

        if (cancelled) return;

        if (!response.ok || !body.userSessionToken) {
          setFailure({
            code: body.code,
            missing: body.missing,
            error: body.error ?? `Resposta inesperada da API (HTTP ${response.status})`,
          });
          return;
        }

        setSession(body);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setFailure({ error: e instanceof Error ? e.message : 'Falha ao criar a sessão' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Ainda não configurado: guia de primeira execução em vez de mensagem de erro.
  if (failure?.code === 'setup_required') {
    return <SetupGuide missing={failure.missing ?? []} />;
  }

  if (failure) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel max-w-lg border-rose-500/30 p-7">
          <p className="label mb-3 text-rose-400/80">
            {failure.code === 'credentials_rejected' ? 'Credenciais recusadas' : 'Falha na inicialização'}
          </p>
          <h1 className="mb-3 text-lg font-semibold">Não foi possível criar a sessão</h1>
          <p className="text-sm leading-relaxed text-cx-muted">{failure.error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-9 rounded-lg border border-cx-line px-4 text-sm text-cx-muted transition-colors hover:border-cx-line2 hover:text-cx-text"
          >
            Tentar de novo
          </button>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 animate-ring rounded-full bg-cx-teal/40" />
          <span className="absolute inset-0 rounded-full border border-cx-teal/40 bg-cx-panel" />
        </div>
        <div className="text-center">
          <p className="font-medium">Criando sessão de usuário</p>
          <p className="mt-1 font-mono text-xs text-cx-dim">
            POST /api/user-sdk-session → createUserSessionForClientSdk()
          </p>
        </div>
      </main>
    );
  }

  return (
    <SdkConsoleProvider>
      <CallixClientProvider domain={session.domain} userSessionToken={session.userSessionToken}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-cx-line bg-cx-bg/85 backdrop-blur">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-cx-teal/15 font-mono text-[11px] font-bold text-cx-teal ring-1 ring-cx-teal/30">
                  cx
                </span>
                <span className="text-sm font-semibold tracking-tight">Callix SDK</span>
                <span className="rounded border border-cx-line bg-cx-raised px-1.5 py-0.5 font-mono text-[10px] text-cx-dim">
                  demo
                </span>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                <span className="text-cx-muted">
                  <span className="text-cx-dim">agente </span>
                  <span className="font-medium text-cx-text">{session.user.name}</span>
                  <span className="text-cx-dim"> · {session.user.login}</span>
                </span>
                <span className="font-mono text-cx-dim">{session.domain}</span>
              </div>
            </div>
          </header>

          <main className="mx-auto grid max-w-[1400px] gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_400px]">
            <OperatorWorkspace />
            <SdkConsole />
          </main>
        </div>
      </CallixClientProvider>
    </SdkConsoleProvider>
  );
}
