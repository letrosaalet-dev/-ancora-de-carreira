-- =====================================================================
-- Âncora de Carreira — WePeople
-- Rode este arquivo uma vez no Supabase: SQL Editor → New query → Run.
-- =====================================================================

create table if not exists public.respostas (
  id                 uuid primary key default gen_random_uuid(),
  criado_em          timestamptz not null default now(),

  nome               text not null,
  empresa            text not null,
  cargo              text,

  -- as 40 notas na ordem das questões 1..40, já com os três 10 aplicados
  respostas          smallint[] not null,
  versao_instrumento text not null default '2026.1',

  -- as 8 médias já calculadas pelo site (é o que dispensa a planilha do meio)
  media_tecnica_funcional numeric(4,2),
  media_adm_geral         numeric(4,2),
  media_autonomia         numeric(4,2),
  media_seguranca         numeric(4,2),
  media_criatividade      numeric(4,2),
  media_dedicacao         numeric(4,2),
  media_desafio           numeric(4,2),
  media_estilo_vida       numeric(4,2),

  -- ranking, para filtrar e ler a lista sem abrir cada registro
  ancora_1 text,
  ancora_2 text,
  ancora_3 text,

  -- Notas válidas: 1 a 6, ou 10 (as três destacadas pelo participante).
  -- Sem subquery: o PostgreSQL não permite SELECT dentro de CHECK.
  constraint respostas_tem_40 check (array_length(respostas, 1) = 40),
  constraint respostas_sem_nulo check (array_position(respostas, null) is null),
  constraint respostas_na_faixa check (
    respostas <@ array[1, 2, 3, 4, 5, 6, 10]::smallint[]
  )
);

create index if not exists respostas_criado_em_idx on public.respostas (criado_em desc);
create index if not exists respostas_empresa_idx   on public.respostas (empresa);

-- ---------------------------------------------------------------------
-- Segurança (RLS)
--
-- O participante NÃO faz login: a página pública usa a chave anônima,
-- que só pode INSERIR. Ler a lista exige estar autenticado — por isso a
-- anonKey pode ficar visível no navegador sem expor as respostas.
-- ---------------------------------------------------------------------
alter table public.respostas enable row level security;

drop policy if exists "qualquer um pode responder" on public.respostas;
create policy "qualquer um pode responder"
  on public.respostas for insert
  to anon, authenticated
  with check (true);

drop policy if exists "só quem tem login lê" on public.respostas;
create policy "só quem tem login lê"
  on public.respostas for select
  to authenticated
  using (true);

-- Ninguém edita nem apaga pela API pública: sem policy de update/delete,
-- essas operações ficam bloqueadas para anon e authenticated.
