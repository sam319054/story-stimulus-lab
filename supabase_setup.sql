create table if not exists public.saved_items (
  id text primary key,
  keyword text not null,
  tone text not null,
  format text not null,
  saved_at timestamptz not null default now(),
  saved_at_label text not null,
  summary text not null default '',
  cards jsonb not null default '[]'::jsonb,
  news_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_items_saved_at_idx
  on public.saved_items (saved_at desc);

alter table public.saved_items enable row level security;

drop policy if exists "No direct public access" on public.saved_items;

create policy "No direct public access"
on public.saved_items
for all
to public
using (false)
with check (false);
