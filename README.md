# Aprender para Jogar - Etapa 1 (login, 4 tipos de acesso, painel do aluno)

## Passo a passo (primeira vez)
1. Crie um projeto grátis em supabase.com.
2. No **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em Run.
3. Em **Authentication > Providers**, ative **Google** e **Azure (Microsoft)** com o Client ID e o Client Secret de cada um.
4. Em **Authentication > URL Configuration**, ponha o endereço do site em Site URL e, em Redirect URLs, `http://localhost:3000/auth/callback` e `https://SEU-SITE.vercel.app/auth/callback`.
5. Copie `.env.example` para `.env.local` e cole a URL e a chave anon (Project Settings > API).
6. No terminal, dentro desta pasta: `npm install` e depois `npm run dev`. Abra http://localhost:3000.
7. Publicar: suba a pasta para o GitHub, importe na Vercel e cadastre as duas variáveis do `.env.local` em Settings > Environment Variables.

## Como virar professor, dono ou empresa
Todo mundo nasce aluno. No SQL Editor do Supabase:
`update perfis set papel = 'professor' where usuario = 'fulano';`

## Onde mexer
- Cores: `app/globals.css` (topo). XP por nível: `app/aluno/page.js`.
- Áreas e quem entra onde: `middleware.js`.

## Ainda falta
- Consentimento dos responsáveis para menores (LGPD) e login da escola.
- Etapas 2 a 5: XP seguro e atividades, painel do professor, rankings e IA, biblioteca.

## Parte 2 (atividades, XP seguro, ranking, professor)
Depois do `schema.sql`, rode também `supabase/schema2.sql` no SQL Editor (ele traz matérias, assuntos e 12 perguntas de exemplo).
- Novas perguntas: insira na tabela `perguntas` (o campo `xp` define a pontuação por dificuldade).
- O aluno só ganha XP na primeira vez que acerta cada pergunta (regra no banco).
- Professor: promova a conta com SQL e use a tela "Meus alunos" para adicionar pelo @usuario.

## Parte 3 (vínculo com aprovação, notificações, dúvidas)
Rode `supabase/schema3.sql` depois do `schema2.sql`.
- O professor só vê o aluno depois que o aluno aceita em "Meus professores".
- Dúvidas: o aluno envia, o professor responde e ganha 15 XP na primeira resposta (mude `xp_duvida` no schema3.sql).
- Ainda sem anexo de imagem nas dúvidas (precisa do Supabase Storage).
