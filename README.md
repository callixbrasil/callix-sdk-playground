# callix-sdk-playground

Softphone de demonstração construído sobre o **Callix Client SDK**. Mostra, lado a lado, a operação
(atender, discar, pausar, qualificar) e o que o SDK está fazendo por baixo — cada transição de estado e
cada comando, com marcação de milissegundos.

Serve para entender o modelo mental do SDK antes de escrever a integração de verdade, e para demonstrar
a integração a clientes e parceiros.

📄 **[Documento técnico: conceitos e capacidades do SDK](https://callixbrasil.github.io/callix-sdk-playground/)**
— arquitetura, fluxo de autenticação, modelo de estados, escopo e pré-requisitos.

> **O console de eventos é instrumentação desta aplicação, não um recurso do SDK.**
> O `CallOperator` expõe um único evento público (`userSessionDropped`); tudo o mais que aparece na coluna
> da direita é estado observado e comandos registrados por código deste repositório. Não dimensione um
> projeto contando com telemetria de transições vinda do SDK.

Relacionado: [callixbrasil/callix-sdk-examples](https://github.com/callixbrasil/callix-sdk-examples) —
exemplos de referência oficiais. Este repositório é uma aplicação de demonstração independente, sobre a
versão **1.0.1** do SDK.

---

## Configuração

Este repositório **não contém credenciais**. Cada pessoa que clona aponta para o próprio tenant.
Se você rodar sem configurar, a aplicação abre uma tela de primeira execução com estas instruções.

**1. Gere um token de API.** Em `https://SEU-SUBDOMINIO.callix.com.br/api-tokens`, crie um token com um
perfil de acesso que tenha permissão de **gerenciar sessões de usuário**.

**2. Crie o `.env` a partir do template.**

```bash
cp .env.template .env
```

| Variável | Exemplo | Papel |
| --- | --- | --- |
| `NEXT_PUBLIC_CALLIX_DOMAIN` | `suaempresa.callix.com.br` | Domínio do tenant, sem protocolo. Vai para o browser (daí o prefixo `NEXT_PUBLIC_`). |
| `CALLIX_API_KEY` | *(token gerado no passo 1)* | Segredo. **Só no servidor** — nunca exposto ao cliente. |
| `CALLIX_USERNAME` | `operador.demo` | Login do operador Callix que a aplicação representa. |

**3. Instale e rode.**

```bash
npm install
npm run dev   # http://localhost:3333
```

O browser precisa de permissão de microfone e de HTTPS (ou `localhost`) para o WebRTC funcionar.

### Cuidados com credenciais

- O `.env` está no `.gitignore`. Confirme com `git status` antes de commitar.
- A `CALLIX_API_KEY` é lida apenas em `src/app/api/user-sdk-session/route.ts`, que roda no servidor. O browser recebe somente o token de sessão de curta duração.
- **Use um login de teste, não o seu.** Criar a sessão invalida as sessões anteriores daquele usuário Callix — se você estiver logado na plataforma, será desconectado.
- Se um token vazar, revogue-o na tela de tokens de API do tenant.

---

## Como a aplicação está organizada

```
src/app/api/user-sdk-session/route.ts   servidor: API key -> token de sessão
src/app/page.tsx                        busca o token e monta o CallixClientProvider
src/components/SetupGuide.tsx           tela de primeira execução (sem .env)
src/components/OperatorWorkspace.tsx    máquina de estados do operador
src/components/StatusControls.tsx       disponível / offline / pausas
src/components/Dialer.tsx               chamada manual, com teclado
src/components/CallPanel.tsx            chamada ativa: timer, controles, áudio, dados
src/components/AfterCallPanel.tsx       pós-atendimento e qualificação
src/components/SdkConsole.tsx           console de transições, comandos e eventos
src/lib/use-signal.ts                   ponte signal -> React (useSyncExternalStore)
```

### O fluxo de autenticação

```
browser --POST /api/user-sdk-session--> servidor da aplicação
                                          CallixServerSdk(domain, API_KEY)
                                            .createUserSessionForClientSdk(login)
browser <--- { userSessionToken } --------
CallixClientProvider(domain, userSessionToken) --> WebRTC/SIP + eventos
```

Numa aplicação real, essa rota é onde você autentica **o seu** usuário e decide qual login Callix ele pode
operar. Criar uma sessão **invalida as sessões anteriores** do mesmo usuário Callix — duas abas competem
entre si.

### A máquina de estados

Toda a aplicação é uma função de `useCallOperatorState().state`:

| Estado | Significado | O que a interface mostra |
| --- | --- | --- |
| `starting` | operador subindo (SIP + configs) | tela de carregamento |
| `idle` | disponível, aguardando chamada | discador |
| `onBreak` | em pausa | pausa atual, discador bloqueado |
| `offline` | desconectado do serviço | botão de ficar disponível |
| `callRinging` | chamada entrante tocando | atender / rejeitar |
| `manualCallSetup` / `manualCallRinging` | chamada manual sendo montada / chamando | cancelar |
| `callInProgress` | conversa estabelecida | espera, desligar, áudio, dados da chamada |
| `afterCall` | pós-atendimento | resultado + qualificação |
| `error` | falha do operador | mensagem de erro |

Os comandos (`becomeAvailable`, `enterOnBreak`, `makeManualCall`, …) são **intenções assíncronas e sem
retorno**: quem confirma é a transição de estado. Por isso a aplicação desabilita botões por estado e
registra tudo no console — é a forma mais rápida de ver quando um comando foi descartado por ser inválido
naquele estado.

### `useSignal`

O `CallOperator` expõe estado como *signals* (`user`, `tenant`, `currentStateKeys`, `currentBreakId`, …),
e o pacote React cobre parte deles com hooks prontos. `src/lib/use-signal.ts` liga qualquer signal ao
React via `useSyncExternalStore` — é assim que o cabeçalho mostra o tenant e as chaves da máquina de
estados.

---

## Notas de implementação

- **Volume de saída** — `useCallOperatorAudioOutputVolume` opera na faixa `0..1`. É o que esta aplicação usa.
- **`goOffline()` vs `stop()`** — `goOffline` mantém o operador vivo (dá para voltar com `becomeAvailable`); `stop()` é terminal e exige `start()` de novo. O `CallixClientProvider` já cuida do ciclo de vida — não chame `stop()` na mão.
- **`CallInfo` cobre `campaign` e `manual`** — chamada receptiva de fila não tem tipo próprio; o contexto disponível vem de `call.data` (`callQueueId`, `inboundNumberPhone`).
- **Um evento público** — `userSessionDropped` é o único em `CallOperatorPublicEvents`; qualquer outra observabilidade sai de estado e signals.
- **Execução em browser** — o `client-sdk` empacota jsSIP/WebRTC. Todos os componentes que o tocam são `'use client'` e o provider só monta depois que o token chega, o que evita quebrar no SSR.
- **O operador fica disponível automaticamente** — `starting` vai direto para `idle` sem nenhum comando. Abrir a página coloca o usuário online e elegível a receber chamada de campanha. Se a sua aplicação não quiser esse efeito, chame `goOffline()` ou `enterOnBreak()` assim que o estado sair de `starting`.

---

## Validado contra tenant real

Executado contra um tenant real, em agosto de 2026.

Medido via Chrome headless com mídia fake:

| Verificação | Resultado |
| --- | --- |
| `createUserSessionForClientSdk` | HTTP 200, devolve token + `{ id, login, name, sessionId }` |
| `starting → idle` | ~2s após montar o provider |
| Pausas do tenant | carregadas automaticamente, com id e nome |
| `enterOnBreak(id)` | `idle → onBreak`, chaves `onBreak.idle · onBreak` |
| `becomeAvailable()` | `onBreak → idle` |
| `goOffline()` | `idle → offline`, chaves `offline.idle · offline` |

Ciclo de chamada validado em teste manual com discagem real:

| Verificação | Resultado |
| --- | --- |
| `makeManualCall()` → chamada estabelecida | ok |
| Painel de chamada (`callInProgress`) | renderizou com dados reais |
| `afterCall` com qualificações do tenant | ok, lista populada e envio aceito |

---

## Comandos

```bash
npm run dev          # desenvolvimento na porta 3333
npm run build        # build de produção
npm run checktypes   # tsc --noEmit
```
