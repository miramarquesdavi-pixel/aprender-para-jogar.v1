-- ============================================================
-- BANCO DE DADOS - PARTE 3 (rode DEPOIS do schema2.sql)
-- Vínculo com aprovação do aluno, notificações, dúvidas aos professores e mais perguntas.
-- ============================================================

-- O vínculo agora nasce "pendente" e só vale depois que o ALUNO aceita (proteção de menores).
-- Vínculos que já existiam passam a valer como "aceito".
alter table vinculos add column status text not null default 'aceito' check (status in ('pendente','aceito'));
alter table vinculos alter column status set default 'pendente';

-- Refaz as regras para o professor só ver alunos cujo vínculo foi ACEITO.
drop policy "professor ve xp" on xp_historico;
drop policy "professor ve alunos" on perfis;
drop policy "ver meus vinculos" on vinculos;
create policy "professor ve xp" on xp_historico for select to authenticated
  using (exists (select 1 from vinculos v where v.professor_id = auth.uid() and v.aluno_id = xp_historico.aluno_id and v.status = 'aceito'));
create policy "professor ve alunos" on perfis for select to authenticated
  using (exists (select 1 from vinculos v where v.professor_id = auth.uid() and v.aluno_id = perfis.id and v.status = 'aceito'));
-- Professor e aluno enxergam os vínculos que envolvem a si mesmos.
create policy "ver meus vinculos" on vinculos for select to authenticated using (professor_id = auth.uid() or aluno_id = auth.uid());
-- O aluno enxerga o nome do professor que pediu (ou tem) vínculo com ele.
create policy "ver professor vinculado" on perfis for select to authenticated
  using (exists (select 1 from vinculos v where v.aluno_id = auth.uid() and v.professor_id = perfis.id));

-- NOTIFICAÇÕES: cada pessoa vê e marca como lidas só as suas.
create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfis on delete cascade,
  texto text not null,
  link text,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table notificacoes enable row level security;
create policy "ver minhas notificacoes" on notificacoes for select to authenticated using (usuario_id = auth.uid());
create policy "marcar minhas como lidas" on notificacoes for update to authenticated using (usuario_id = auth.uid());
revoke update on notificacoes from authenticated, anon;
grant update (lida) on notificacoes to authenticated;

-- DÚVIDAS: o aluno pergunta, o professor responde.
create table duvidas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references perfis on delete cascade,
  professor_id uuid not null references perfis on delete cascade,
  titulo text not null,
  texto text not null,
  resposta text,
  respondida_em timestamptz,
  criado_em timestamptz not null default now()
);
alter table duvidas enable row level security;
create policy "ver minhas duvidas" on duvidas for select to authenticated using (aluno_id = auth.uid() or professor_id = auth.uid());

-- Função interna que cria notificações (ninguém de fora consegue chamar).
create function notificar(u uuid, t text, l text) returns void
language sql security definer set search_path = public as $$ insert into notificacoes (usuario_id, texto, link) values (u, t, l) $$;
revoke execute on function notificar(uuid, text, text) from public, anon, authenticated;

-- Professor pede vínculo: fica pendente e o aluno é avisado.
create or replace function vincular_aluno(p_usuario text) returns void
language plpgsql security definer set search_path = public as $$
declare a uuid; nome_prof text;
begin
  if (select papel from perfis where id = auth.uid()) <> 'professor' then raise exception 'apenas professores'; end if;
  select id into a from perfis where usuario = lower(regexp_replace(p_usuario, '^@', '')) and papel = 'aluno';
  if a is null then raise exception 'aluno não encontrado'; end if;
  insert into vinculos (professor_id, aluno_id) values (auth.uid(), a) on conflict do nothing;
  select nome into nome_prof from perfis where id = auth.uid();
  perform notificar(a, nome_prof || ' quer acompanhar você. Aceite ou recuse.', '/aluno/professores');
end $$;

-- Aluno aceita ou recusa o pedido de um professor.
create function responder_vinculo(p_professor uuid, p_aceitar boolean) returns void
language plpgsql security definer set search_path = public as $$
declare nome_aluno text;
begin
  select nome into nome_aluno from perfis where id = auth.uid();
  if p_aceitar then
    update vinculos set status = 'aceito' where professor_id = p_professor and aluno_id = auth.uid();
    perform notificar(p_professor, nome_aluno || ' aceitou seu pedido.', '/professor');
  else
    delete from vinculos where professor_id = p_professor and aluno_id = auth.uid();
  end if;
end $$;

-- Aluno envia uma dúvida (só para professor com vínculo aceito).
create function enviar_duvida(p_professor uuid, p_titulo text, p_texto text) returns void
language plpgsql security definer set search_path = public as $$
declare nome_aluno text;
begin
  if not exists (select 1 from vinculos where professor_id = p_professor and aluno_id = auth.uid() and status = 'aceito') then raise exception 'sem vínculo'; end if;
  if length(trim(p_titulo)) not between 1 and 120 or length(trim(p_texto)) not between 1 and 2000 then raise exception 'texto inválido'; end if;
  insert into duvidas (aluno_id, professor_id, titulo, texto) values (auth.uid(), p_professor, trim(p_titulo), trim(p_texto));
  select nome into nome_aluno from perfis where id = auth.uid();
  perform notificar(p_professor, nome_aluno || ' enviou uma dúvida.', '/professor/duvidas');
end $$;

-- Professor responde; ganha XP só na PRIMEIRA resposta de cada dúvida.
create function responder_duvida(p_duvida uuid, p_resposta text) returns void
language plpgsql security definer set search_path = public as $$
declare d duvidas; xp_duvida constant int := 15;  -- XP do professor por dúvida respondida: mude aqui
begin
  select * into d from duvidas where id = p_duvida and professor_id = auth.uid();
  if not found then raise exception 'dúvida não encontrada'; end if;
  if length(trim(p_resposta)) not between 1 and 2000 then raise exception 'texto inválido'; end if;
  update duvidas set resposta = trim(p_resposta), respondida_em = now() where id = p_duvida;
  if d.resposta is null then
    insert into xp_historico (aluno_id, quantidade, motivo) values (auth.uid(), xp_duvida, 'dúvida respondida');
    update perfis set xp = xp + xp_duvida where id = auth.uid();
  end if;
  perform notificar(d.aluno_id, 'Seu professor respondeu sua dúvida.', '/aluno/duvidas');
end $$;

revoke execute on function vincular_aluno(text), responder_vinculo(uuid, boolean), enviar_duvida(uuid, text, text), responder_duvida(uuid, text) from public, anon;
grant execute on function vincular_aluno(text), responder_vinculo(uuid, boolean), enviar_duvida(uuid, text, text), responder_duvida(uuid, text) to authenticated;

-- MAIS CONTEÚDO: um assunto com perguntas em cada matéria que ainda estava vazia.
insert into assuntos values ('ing-basico','ing','Vocabulário básico'),('geo-brasil','geo','Brasil'),('his-brasil','his','História do Brasil'),
  ('bio-geral','bio','Células e plantas'),('fis-forca','fis','Forças'),('qui-basico','qui','Química básica');
insert into perguntas (assunto_id, enunciado, opcoes, correta, explicacao, dificuldade, xp) values
 ('ing-basico','Como se diz “gato” em inglês?','{dog,cat,bird,fish}',1,'Gato = cat. Dog é cachorro.','facil',5),
 ('ing-basico','Qual é o plural de “child”?','{childs,childes,children,childrens}',2,'Child é irregular: o plural é children.','media',10),
 ('geo-brasil','Qual é a capital do Brasil?','{Rio de Janeiro,São Paulo,Brasília,Salvador}',2,'Brasília é a capital federal desde 1960.','facil',5),
 ('geo-brasil','Qual é o maior estado brasileiro em área?','{Amazonas,Pará,Mato Grosso,Minas Gerais}',0,'O Amazonas é o maior estado do país.','media',10),
 ('his-brasil','Em que ano o Brasil declarou a independência?','{1500,1822,1889,1930}',1,'Em 7 de setembro de 1822.','facil',5),
 ('his-brasil','Que forma de governo o Brasil adotou em 1889?','{Monarquia,República,Colônia,Império}',1,'Em 1889 foi proclamada a República.','media',10),
 ('bio-geral','Que gás as plantas absorvem na fotossíntese?','{Oxigênio,Gás carbônico,Nitrogênio,Hélio}',1,'Elas absorvem gás carbônico e liberam oxigênio.','facil',5),
 ('bio-geral','Qual organela produz energia na célula?','{Núcleo,Mitocôndria,Ribossomo,Lisossomo}',1,'A mitocôndria produz a energia da célula.','media',10),
 ('fis-forca','Qual é a unidade de força no Sistema Internacional?','{Joule,Watt,Newton,Pascal}',2,'A força é medida em newtons (N).','media',10),
 ('qui-basico','Qual é a fórmula química da água?','{CO2,H2O,O2,NaCl}',1,'Duas partes de hidrogênio e uma de oxigênio: H2O.','facil',5);
