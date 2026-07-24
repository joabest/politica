# Prontidão para produção

## Implementado

- Sessões Supabase renovadas no proxy e rotas privadas protegidas.
- Recuperação de senha PKCE completa, retorno interno validado e mensagem resistente à enumeração de contas.
- Modo demo opt-in, sem credenciais padrão; cookie HTTP-only, SameSite e Secure em produção.
- Radar exige usuário autenticado, valida payload com Zod, limita solicitações, limita candidatos e não devolve erros internos.
- Cabeçalhos contra MIME sniffing, framing/clickjacking e acesso desnecessário a câmera, microfone e localização.
- Pipeline reproduzível com lockfile, lint, TypeScript, testes e build.

## Banco e migrations

Aplicar, em ordem, `supabase/migrations/001_arcanum_schema.sql` a `006_access_control.sql`. As políticas RLS são a fronteira de isolamento; revise o e-mail administrativo legado em `006_access_control.sql` antes de produção e prefira migrá-lo para um papel persistido por organização.

## Configuração externa inevitável

### Supabase Dashboard

**Authentication → URL Configuration → Redirect URLs**: adicione `https://SEU-DOMINIO/auth/callback`. Valide solicitando recuperação e confirmando que o link chega a `/redefinir-senha`. Recuperação fica bloqueada sem isso.

**SQL Editor**: execute migrations 001–006 em ordem. Valide consultando tabelas e políticas no Table Editor. Persistência multiusuário fica bloqueada sem isso.

### Vercel

**Project → Settings → Environment Variables**: defina `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GROQ_API_KEY` e, opcionalmente, `GROQ_MODEL`. Valide com novo deploy, login e scan do Radar. Análise de IA fica indisponível sem a chave Groq; o Radar informa que itens não foram analisados.

## Riscos restantes

- O rate limit do Radar é por instância; ambientes de alto volume devem substituí-lo por Redis/KV compartilhado.
- Partes do modo demonstração persistem no navegador e não oferecem sincronização multi-dispositivo; produção deve usar Supabase.
- A migration 006 contém um administrador por e-mail legado e requer migração futura para papéis por organização.

## Checklist

1. Configurar variáveis e redirect URL.
2. Aplicar migrations e inspecionar RLS com duas contas de teste.
3. Manter `ARCANUM_ENABLE_DEMO=false`.
4. Executar `npm ci && npm run check`.
5. Validar login, recuperação, troca de campanha, upload e Radar em preview.
