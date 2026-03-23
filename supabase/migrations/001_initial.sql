-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Chapters
create table chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  emoji text,
  started_at date not null,
  ended_at date,
  created_at timestamptz default now()
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  chapter_id uuid references chapters(id) on delete set null,
  parent_goal_id uuid references goals(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  goal_id uuid references goals(id) on delete set null,
  title text not null,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  created_at timestamptz default now()
);

-- Journal entries
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  chapter_id uuid references chapters(id) on delete set null,
  title text,
  content text not null,
  entry_type text not null default 'journal'
    check (entry_type in ('journal', 'prompt', 'whatif')),
  prompt text,
  created_at timestamptz default now()
);

-- Journal ↔ Goals link table
create table journal_entry_goals (
  journal_entry_id uuid references journal_entries(id) on delete cascade,
  goal_id uuid references goals(id) on delete cascade,
  primary key (journal_entry_id, goal_id)
);

-- Row Level Security
alter table chapters enable row level security;
alter table goals enable row level security;
alter table tasks enable row level security;
alter table journal_entries enable row level security;
alter table journal_entry_goals enable row level security;

-- RLS policies: users can only see/edit their own data
create policy "chapters: own rows" on chapters
  for all using (auth.uid() = user_id);

create policy "goals: own rows" on goals
  for all using (auth.uid() = user_id);

create policy "tasks: own rows" on tasks
  for all using (auth.uid() = user_id);

create policy "journal_entries: own rows" on journal_entries
  for all using (auth.uid() = user_id);

create policy "journal_entry_goals: via journal entry" on journal_entry_goals
  for all using (
    exists (
      select 1 from journal_entries je
      where je.id = journal_entry_id and je.user_id = auth.uid()
    )
  );
