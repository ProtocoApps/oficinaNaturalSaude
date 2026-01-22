create table if not exists public.avaliacoes_produto (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comentario text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (produto_id, user_id)
);

alter table public.avaliacoes_produto enable row level security;

create policy "avaliacoes_select" on public.avaliacoes_produto
for select using (true);

create policy "avaliacoes_insert" on public.avaliacoes_produto
for insert with check (auth.uid() = user_id);

create policy "avaliacoes_update" on public.avaliacoes_produto
for update using (auth.uid() = user_id);

create policy "avaliacoes_delete" on public.avaliacoes_produto
for delete using (auth.uid() = user_id);
