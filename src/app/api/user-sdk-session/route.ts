import { CallixServerSdk } from '@callixbrasil/server-sdk';

/** Variáveis que a aplicação precisa para falar com a Callix. */
const REQUIRED_VARS = ['NEXT_PUBLIC_CALLIX_DOMAIN', 'CALLIX_API_KEY', 'CALLIX_USERNAME'] as const;

/**
 * Troca a chave de API (segredo do servidor) por um token de sessão de curta duração
 * que pode ser entregue ao browser e consumido pelo Client SDK.
 *
 * Numa aplicação real, esta rota é o ponto onde você autentica o SEU usuário e
 * decide qual login Callix ele pode operar — nunca envie a CALLIX_API_KEY ao cliente.
 *
 * Atenção: criar uma sessão invalida as sessões anteriores do mesmo usuário Callix.
 */
export async function POST() {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());

  // Nada configurado ainda: quem clonou o repositório ainda não criou o .env.
  if (missing.length > 0) {
    return Response.json(
      {
        code: 'setup_required',
        missing,
        error: `Configuração ausente: ${missing.join(', ')}.`,
      },
      { status: 503 },
    );
  }

  const domain = process.env.NEXT_PUBLIC_CALLIX_DOMAIN as string;
  const callixServerSdk = new CallixServerSdk(domain, process.env.CALLIX_API_KEY as string);

  try {
    const userSession = await callixServerSdk.createUserSessionForClientSdk(process.env.CALLIX_USERNAME as string);

    return Response.json({
      userSessionToken: userSession.userSessionToken,
      user: userSession.user,
      domain,
    });
  } catch (error) {
    // Configurado, mas a Callix recusou. Quase sempre é domínio, token ou login errado.
    const status = extractStatus(error);

    return Response.json(
      {
        code: status === 401 || status === 403 ? 'credentials_rejected' : 'callix_unreachable',
        status,
        error: describeFailure(status, domain),
      },
      { status: 502 },
    );
  }
}

function extractStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }

  return undefined;
}

function describeFailure(status: number | undefined, domain: string): string {
  if (status === 401 || status === 403) {
    return (
      'A Callix recusou as credenciais. Verifique se CALLIX_API_KEY é válida e se o perfil de acesso do token ' +
      'tem permissão de gerenciar sessões de usuário.'
    );
  }

  if (status === 404) {
    return `Usuário não encontrado em ${domain}. Confira o valor de CALLIX_USERNAME.`;
  }

  return `Não foi possível falar com ${domain}. Confira NEXT_PUBLIC_CALLIX_DOMAIN e a conectividade de rede.`;
}
