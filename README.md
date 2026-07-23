# Arcanum — Fase 5

Plataforma Next.js para inteligência estratégica e comunicação política. Esta entrega adiciona backend opcional com Supabase, autenticação real, proteção de rotas e CRUD de planejamento. Sem configuração externa, a aplicação continua funcional em modo demonstração com persistência no navegador.

## Recursos

- Dashboard e módulos estratégicos da V4.
- Login real por e-mail e senha com Supabase Auth.
- Sessão SSR armazenada em cookies.
- Proteção das rotas internas com `proxy.ts` do Next.js 16.
- Row Level Security para que cada usuário veja apenas seus próprios registros.
- Kanban funcional: criar, buscar, mover e excluir tarefas.
- Fallback localStorage quando o Supabase ainda não estiver configurado.
- Schema inicial para tarefas, estratégias, calendário, conteúdos e favoritos.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem `.env.local`, use:

```text
Usuário: mkt2026
Senha: mkt2026
```

## Ativar o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/migrations/001_arcanum_schema.sql`.
3. Em Authentication → Users, crie o primeiro usuário com e-mail e senha.
4. Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

5. Reinicie o servidor. O formulário de login passa automaticamente de usuário demonstrativo para e-mail real.

## Vercel

Adicione as mesmas variáveis em Settings → Environment Variables. Use Framework Preset `Next.js`, Build Command `npm run build` e deixe Output Directory vazio.

## Segurança

A chave publicável pode ser usada no navegador porque o acesso aos dados é limitado por autenticação e Row Level Security. Não coloque `service_role` em variáveis `NEXT_PUBLIC_*`. As ações sensíveis futuras devem validar autorização também no servidor.

## Próxima fase

- CRUD completo de estratégias, eventos e conteúdos.
- Perfis e papéis de equipe.
- Relatórios persistentes.
- Gemini com recuperação da biblioteca estratégica.
