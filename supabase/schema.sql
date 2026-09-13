-- =====================================================================
-- Gokhan Ipek website — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ARTICLES
-- ---------------------------------------------------------------------
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  excerpt     text,
  content     text,               -- HTML produced by the rich text editor
  cover_url   text,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- GAMES
-- ---------------------------------------------------------------------
create table if not exists public.games (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  description   text,
  thumbnail_url text,
  embed_url     text,             -- URL of the playable game (iframe src)
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Keep updated_at fresh on updates
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- Rule: anyone can READ published rows; only authenticated users (you)
-- can read drafts and insert / update / delete.
-- ---------------------------------------------------------------------
alter table public.articles enable row level security;
alter table public.games    enable row level security;

-- ARTICLES policies
drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published"
  on public.articles for select
  using (published = true);

drop policy if exists "articles_auth_read_all" on public.articles;
create policy "articles_auth_read_all"
  on public.articles for select
  to authenticated
  using (true);

drop policy if exists "articles_auth_insert" on public.articles;
create policy "articles_auth_insert"
  on public.articles for insert
  to authenticated
  with check (true);

drop policy if exists "articles_auth_update" on public.articles;
create policy "articles_auth_update"
  on public.articles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "articles_auth_delete" on public.articles;
create policy "articles_auth_delete"
  on public.articles for delete
  to authenticated
  using (true);

-- GAMES policies
drop policy if exists "games_public_read_published" on public.games;
create policy "games_public_read_published"
  on public.games for select
  using (published = true);

drop policy if exists "games_auth_read_all" on public.games;
create policy "games_auth_read_all"
  on public.games for select
  to authenticated
  using (true);

drop policy if exists "games_auth_insert" on public.games;
create policy "games_auth_insert"
  on public.games for insert
  to authenticated
  with check (true);

drop policy if exists "games_auth_update" on public.games;
create policy "games_auth_update"
  on public.games for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "games_auth_delete" on public.games;
create policy "games_auth_delete"
  on public.games for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  description   text,
  thumbnail_url text,
  live_url      text,             -- optional link to a live demo
  repo_url      text,             -- optional link to source code
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects_public_read_published" on public.projects;
create policy "projects_public_read_published"
  on public.projects for select
  using (published = true);

drop policy if exists "projects_auth_read_all" on public.projects;
create policy "projects_auth_read_all"
  on public.projects for select
  to authenticated
  using (true);

drop policy if exists "projects_auth_insert" on public.projects;
create policy "projects_auth_insert"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "projects_auth_update" on public.projects;
create policy "projects_auth_update"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "projects_auth_delete" on public.projects;
create policy "projects_auth_delete"
  on public.projects for delete
  to authenticated
  using (true);
