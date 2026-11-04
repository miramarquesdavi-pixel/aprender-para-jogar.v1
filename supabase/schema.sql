-- ============================================================
-- BANCO DE DADOS - ETAPA 1 (cole tudo no Supabase > SQL Editor > Run)
-- ============================================================

-- Os 4 tipos de acesso da plataforma.
create type papel as enum ('aluno', 'professor', 'dono', 'empresa');

-- Uma linha por pessoa, ligada à conta de login (auth.users).
create table perfis (
  id uuid primary key references auth.users on delete cascade,
  nome text not null,
  -- @usuario: único, só letras minúsculas, números e _ (3 a 20 caracteres), sem o "@".
  usuario text not null unique check (usuario ~ '^[a-z0-9_]{3,20}$'),
  papel papel not null default 'aluno',   -- todo mundo nasce aluno
  avatar text,
  xp integer not null default 0,
  criado_em timestamptz not null default now()
);

-- Liga a segurança por linha: sem regra explícita, ninguém acessa nada.
alter table perfis enable row level security;

-- Cada pessoa só enxerga o próprio perfil (professores e ranking entram nas próximas etapas).
create policy "ver o proprio perfil" on perfis for select to authenticated using (auth.uid() = id);
create policy "editar o proprio perfil" on perfis for update to authenticated using (auth.uid() = id);

-- Mesmo editando o próprio perfil, a pessoa só pode mudar nome e avatar.
-- Assim ninguém consegue se promover a "dono" nem dar XP a si mesmo pelo navegador.
revoke update on perfis from authenticated, anon;
grant update (nome, avatar) on perfis to authenticated;

-- Quando alguém cria conta (e-mail, Google ou Microsoft), o perfil é criado automaticamente.
create function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfis (id, nome, usuario) values (
    new.id,
    -- nome vindo do cadastro ou do Google/Microsoft; se faltar, usa o começo do e-mail
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- @usuario escolhido no cadastro; no login social, gera um a partir do e-mail + 4 números
    coalesce(lower(new.raw_user_meta_data->>'usuario'),
      left(lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')), 12) || floor(random() * 9000 + 1000)::int)
  );
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

-- COMO PROMOVER ALGUÉM (rode aqui no SQL Editor, nunca pelo site):
-- update perfis set papel = 'professor' where usuario = 'fulano';   -- ou 'dono' / 'empresa'
