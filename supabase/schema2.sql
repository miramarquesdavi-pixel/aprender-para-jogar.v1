-- ============================================================
-- BANCO DE DADOS - PARTE 2 (rode DEPOIS do schema.sql, no SQL Editor)
-- Matérias, perguntas, XP à prova de trapaça, ranking e vínculo professor-aluno.
-- ============================================================

-- Catálogo: matérias > assuntos > perguntas.
create table materias (id text primary key, nome text not null, icone text);
create table assuntos (id text primary key, materia_id text not null references materias, nome text not null);
create table perguntas (
  id uuid primary key default gen_random_uuid(),
  assunto_id text not null references assuntos,
  enunciado text not null,
  opcoes text[] not null,               -- alternativas na ordem em que aparecem
  correta int not null,                 -- posição da certa (0 = primeira). NUNCA é enviada ao navegador.
  explicacao text,                      -- mostrada depois que o aluno responde
  dificuldade text not null check (dificuldade in ('facil','media','dificil')),
  xp int not null                       -- XP desta pergunta: ajuste aqui os valores por dificuldade
);

-- Registro de todo XP ganho. A regra "unique" impede ganhar XP duas vezes na mesma pergunta.
create table xp_historico (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references perfis on delete cascade,
  pergunta_id uuid references perguntas,
  quantidade int not null,
  motivo text not null,
  criado_em timestamptz not null default now(),
  unique (aluno_id, pergunta_id)
);

-- Quais alunos cada professor acompanha.
create table vinculos (
  professor_id uuid references perfis on delete cascade,
  aluno_id uuid references perfis on delete cascade,
  primary key (professor_id, aluno_id)
);

alter table materias enable row level security;
alter table assuntos enable row level security;
alter table perguntas enable row level security;
alter table xp_historico enable row level security;
alter table vinculos enable row level security;

-- Quem está logado lê o catálogo; mas da tabela de perguntas NÃO pode ler a coluna "correta".
create policy "ler materias" on materias for select to authenticated using (true);
create policy "ler assuntos" on assuntos for select to authenticated using (true);
create policy "ler perguntas" on perguntas for select to authenticated using (true);
revoke select on perguntas from authenticated, anon;
grant select (id, assunto_id, enunciado, opcoes, dificuldade, xp) on perguntas to authenticated;

-- O aluno vê o próprio histórico; o professor vê o histórico dos seus alunos.
create policy "ver meu xp" on xp_historico for select to authenticated using (aluno_id = auth.uid());
create policy "professor ve xp" on xp_historico for select to authenticated
  using (exists (select 1 from vinculos v where v.professor_id = auth.uid() and v.aluno_id = xp_historico.aluno_id));
create policy "ver meus vinculos" on vinculos for select to authenticated using (professor_id = auth.uid());
-- O professor também enxerga o perfil dos alunos vinculados a ele (e só deles).
create policy "professor ve alunos" on perfis for select to authenticated
  using (exists (select 1 from vinculos v where v.professor_id = auth.uid() and v.aluno_id = perfis.id));

-- RESPONDER: o banco confere a resposta e dá o XP. O navegador só envia a opção escolhida.
create function responder(p_pergunta uuid, p_opcao int) returns json
language plpgsql security definer set search_path = public as $$
declare q perguntas; ganho int := 0; ja boolean;
begin
  if (select papel from perfis where id = auth.uid()) <> 'aluno' then raise exception 'apenas alunos'; end if;
  select * into q from perguntas where id = p_pergunta;
  if not found then raise exception 'pergunta inexistente'; end if;
  -- Já ganhou XP nesta pergunta antes? Então responder de novo não rende XP.
  select exists (select 1 from xp_historico where aluno_id = auth.uid() and pergunta_id = p_pergunta) into ja;
  if p_opcao = q.correta and not ja then
    insert into xp_historico (aluno_id, pergunta_id, quantidade, motivo) values (auth.uid(), p_pergunta, q.xp, 'atividade');
    update perfis set xp = xp + q.xp where id = auth.uid();
    ganho := q.xp;
  end if;
  return json_build_object('correta', p_opcao = q.correta, 'xp', ganho, 'certa', q.correta, 'explicacao', q.explicacao, 'repetida', ja);
end $$;

-- RANKING: top 10 + a posição do próprio aluno (assim quem está embaixo não fica exposto nem constrangido).
create function ranking_geral() returns table (posicao bigint, nome text, usuario text, xp int, eu boolean)
language sql security definer set search_path = public stable as $$
  with r as (select row_number() over (order by xp desc, criado_em) as posicao, nome, usuario, xp, id from perfis where papel = 'aluno')
  select posicao, nome, usuario, xp, id = auth.uid() from r where posicao <= 10 or id = auth.uid() order by posicao;
$$;

-- VINCULAR: o professor adiciona um aluno pelo @usuario.
create function vincular_aluno(p_usuario text) returns void
language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  if (select papel from perfis where id = auth.uid()) <> 'professor' then raise exception 'apenas professores'; end if;
  select id into a from perfis where usuario = lower(regexp_replace(p_usuario, '^@', '')) and papel = 'aluno';
  if a is null then raise exception 'aluno não encontrado'; end if;
  insert into vinculos (professor_id, aluno_id) values (auth.uid(), a) on conflict do nothing;
end $$;

-- Só quem está logado pode chamar essas funções.
revoke execute on function responder(uuid, int), ranking_geral(), vincular_aluno(text) from public, anon;
grant execute on function responder(uuid, int), ranking_geral(), vincular_aluno(text) to authenticated;

-- ---------- CONTEÚDO INICIAL (exemplos reais; amplie quando quiser) ----------
insert into materias values ('mat','Matemática','➗'),('por','Português','📖'),('ing','Inglês','🌎'),('geo','Geografia','🗺️'),
  ('his','História','🏛️'),('bio','Biologia','🧬'),('fis','Física','⚡'),('qui','Química','🧪');
insert into assuntos values ('mat-adicao','mat','Adição'),('mat-subtracao','mat','Subtração'),('mat-multiplicacao','mat','Multiplicação'),
  ('mat-divisao','mat','Divisão'),('mat-raiz','mat','Raiz quadrada'),('por-verbos','por','Verbos'),('por-substantivos','por','Substantivos');
insert into perguntas (assunto_id, enunciado, opcoes, correta, explicacao, dificuldade, xp) values
 ('mat-adicao','Quanto é 48 + 37?','{75,85,95,84}',1,'8 + 7 = 15 (vai 1); 4 + 3 + 1 = 8. Resultado: 85.','facil',5),
 ('mat-adicao','Ana tinha 125 figurinhas e ganhou 76. Com quantas ficou?','{191,201,211,200}',1,'125 + 76 = 201.','media',10),
 ('mat-subtracao','Quanto é 90 − 38?','{52,62,48,58}',0,'90 − 38 = 52.','facil',5),
 ('mat-subtracao','Um ônibus tinha 52 passageiros. Desceram 19 e subiram 7. Quantos ficaram?','{40,26,33,45}',0,'52 − 19 = 33 e 33 + 7 = 40.','media',10),
 ('mat-multiplicacao','Quanto é 7 × 9?','{56,63,72,49}',1,'7 × 9 = 63.','facil',5),
 ('mat-multiplicacao','Uma caixa tem 12 ovos. Quantos ovos há em 15 caixas?','{150,170,180,160}',2,'12 × 15 = 180.','media',10),
 ('mat-divisao','Quanto é 72 ÷ 8?','{8,9,7,6}',1,'8 × 9 = 72, então 72 ÷ 8 = 9.','facil',5),
 ('mat-divisao','Dividindo 245 balas entre 5 crianças, quantas balas cada uma recebe?','{39,49,59,45}',1,'245 ÷ 5 = 49.','media',10),
 ('mat-raiz','Qual é a raiz quadrada de 81?','{7,8,9,11}',2,'9 × 9 = 81.','facil',5),
 ('mat-raiz','Um quadrado tem área de 225 cm². Quanto mede cada lado?','{12,15,25,45}',1,'O lado é a raiz da área: 15 × 15 = 225.','dificil',20),
 ('por-verbos','Em “Os alunos estudam muito”, qual palavra é o verbo?','{alunos,estudam,muito,Os}',1,'Verbo indica ação: quem estuda, estuda.','facil',5),
 ('por-substantivos','Qual destas palavras é um substantivo?','{correr,bonito,cadeira,rapidamente}',2,'Substantivo dá nome a seres e objetos: cadeira.','facil',5);
