'use client';

import { useState } from 'react';

import { CheckIcon } from './icons';

const VARS = [
  {
    name: 'NEXT_PUBLIC_CALLIX_DOMAIN',
    what: 'Domínio do seu tenant, sem protocolo',
    example: 'suaempresa.callix.com.br',
  },
  {
    name: 'CALLIX_API_KEY',
    what: 'Token de API — fica só no servidor, nunca vai ao browser',
    example: 'gerado na plataforma',
  },
  {
    name: 'CALLIX_USERNAME',
    what: 'Login do operador Callix que esta aplicação representa',
    example: 'operador.demo',
  },
] as const;

/**
 * Tela de primeira execução: aparece quando o .env ainda não foi criado.
 * Existe para que quem clona o repositório saiba exatamente o que fazer.
 */
export function SetupGuide({ missing }: { missing: string[] }) {
  const [copied, setCopied] = useState(false);

  const command = 'cp .env.template .env';

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <header>
        <p className="label mb-2">Primeira execução</p>
        <h1 className="text-2xl font-semibold tracking-tight">Configure o acesso à sua conta Callix</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-cx-muted">
          Esta aplicação não vem com credenciais. Cada pessoa que clona o repositório aponta para o próprio
          tenant, com o próprio token e o próprio operador.
        </p>
      </header>

      {/* passo 1 */}
      <section className="panel p-5">
        <p className="label mb-3">Passo 1 · criar o arquivo local</p>
        <div className="flex items-center gap-2 rounded-lg border border-cx-line bg-cx-raised p-3">
          <code className="flex-1 font-mono text-sm text-cx-text">{command}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(command);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="rounded-md border border-cx-line px-2.5 py-1 text-xs text-cx-dim transition-colors hover:border-cx-line2 hover:text-cx-text"
          >
            {copied ? 'copiado' : 'copiar'}
          </button>
        </div>
        <p className="mt-2.5 text-xs text-cx-dim">
          O <code className="font-mono">.env</code> está no <code className="font-mono">.gitignore</code> — suas
          credenciais não entram no controle de versão.
        </p>
      </section>

      {/* passo 2 */}
      <section className="panel p-5">
        <p className="label mb-3">Passo 2 · preencher as três variáveis</p>
        <ul className="space-y-3">
          {VARS.map((v) => {
            const isMissing = missing.includes(v.name);

            return (
              <li key={v.name} className="flex gap-3">
                <span className="mt-1.5 shrink-0">
                  {isMissing ? (
                    <span className="block h-1.5 w-1.5 rounded-full bg-amber-400" />
                  ) : (
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[13px] text-cx-text">
                    {v.name}
                    {!isMissing && <span className="ml-2 text-[11px] text-emerald-400">definida</span>}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-cx-muted">{v.what}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-cx-dim">{v.example}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* passo 3 */}
      <section className="panel p-5">
        <p className="label mb-3">Passo 3 · gerar o token de API</p>
        <ol className="space-y-1.5 pl-4 text-sm leading-relaxed text-cx-muted [list-style:decimal]">
          <li>
            Acesse <code className="font-mono text-cx-text">https://SEU-SUBDOMINIO.callix.com.br/api-tokens</code>
          </li>
          <li>Clique em “Criar token”</li>
          <li>
            Escolha um perfil de acesso com permissão de{' '}
            <span className="text-cx-text">gerenciar sessões de usuário</span>
          </li>
          <li>
            Copie o valor para <code className="font-mono text-cx-text">CALLIX_API_KEY</code>
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-10 rounded-lg bg-cx-teal px-5 text-sm font-semibold text-cx-bg transition-all hover:brightness-110 active:scale-[0.99]"
        >
          Já configurei — tentar de novo
        </button>
        <p className="text-xs text-cx-dim">Reinicie o servidor de desenvolvimento após editar o .env.</p>
      </div>
    </main>
  );
}
