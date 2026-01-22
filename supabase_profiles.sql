-- 1. Cria a tabela de perfis públicos
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default now()
);

-- 2. Habilita segurança
alter table public.profiles enable row level security;

-- 3. Permite que o admin (e o próprio usuário) vejam os dados
create policy "Perfis visíveis para todos (admin filtra no front)" 
on public.profiles for select using (true);

-- 4. Função que roda automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 5. Ativa o gatilho (trigger)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. (Opcional) Copia usuários que JÁ existem para a nova tabela
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
