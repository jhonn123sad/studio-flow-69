-- Initial schema for Painel de Produção

-- 1. Profiles
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 2. Content Formats
create table if not exists public.content_formats (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    status text default 'Ativo',
    tags text[],
    created_at timestamp with time zone default now()
);

alter table public.content_formats enable row level security;
create policy "Users can manage their own content_formats" on public.content_formats
    for all using (auth.uid() = user_id);

-- 3. Content Format Links
create table if not exists public.content_format_links (
    id uuid default gen_random_uuid() primary key,
    format_id uuid references public.content_formats(id) on delete cascade not null,
    title text not null,
    url text not null
);

-- 4. Content Format Images
create table if not exists public.content_format_images (
    id uuid default gen_random_uuid() primary key,
    format_id uuid references public.content_formats(id) on delete cascade not null,
    url text not null,
    alt_text text
);

-- 5. Reference Categories
create table if not exists public.reference_categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    icon text,
    color text
);

alter table public.reference_categories enable row level security;
create policy "Users can manage their own categories" on public.reference_categories
    for all using (auth.uid() = user_id);

-- 6. Reference Topics
create table if not exists public.reference_topics (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.reference_categories(id) on delete cascade not null,
    title text not null,
    description text,
    status text,
    tags text[]
);

-- 7. Projects
create table if not exists public.projects (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    cover_url text,
    status text default 'Ideias',
    priority text default 'Média',
    tags text[],
    start_date date,
    deadline date,
    created_at timestamp with time zone default now()
);

alter table public.projects enable row level security;
create policy "Users can manage their own projects" on public.projects
    for all using (auth.uid() = user_id);

-- 8. Project Notes
create table if not exists public.project_notes (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    content jsonb,
    plain_text text,
    updated_at timestamp with time zone default now()
);

-- 9. Project Links
create table if not exists public.project_links (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    title text not null,
    url text not null
);

-- 10. Project Images
create table if not exists public.project_images (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    url text not null,
    alt_text text
);

-- 11. Kanban Columns
create table if not exists public.project_kanban_columns (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    title text not null,
    "order" integer not null
);

-- 12. Project Tasks
create table if not exists public.project_tasks (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    column_id uuid references public.project_kanban_columns(id) on delete set null,
    title text not null,
    description text,
    status text default 'Pendente',
    priority text default 'Média',
    deadline date,
    completed boolean default false,
    "order" integer default 0
);

-- 13. Task Checklist Items
create table if not exists public.project_task_checklist_items (
    id uuid default gen_random_uuid() primary key,
    task_id uuid references public.project_tasks(id) on delete cascade not null,
    title text not null,
    completed boolean default false
);
