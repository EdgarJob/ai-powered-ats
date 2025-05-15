-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create enum types
create type user_role as enum ('admin', 'member');
create type job_status as enum ('draft', 'published', 'closed');
create type candidate_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected');

-- Organizations table
create table organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Organization credits table
create table org_credits (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references organizations(id) on delete cascade,
    credits integer not null default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Users table (uses Supabase Auth)
create table users (
    id uuid primary key references auth.users on delete cascade,
    org_id uuid references organizations(id) on delete cascade,
    role user_role not null default 'member',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Jobs table
create table jobs (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references organizations(id) on delete cascade,
    title text not null,
    description text not null,
    requirements text[] not null default '{}',
    status job_status not null default 'draft',
    created_by uuid not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Candidates table
create table candidates (
    id uuid primary key default gen_random_uuid(),
    job_id uuid references jobs(id) on delete cascade,
    full_name text not null,
    email text not null,
    phone text,
    resume_url text not null,
    status candidate_status not null default 'pending',
    embedding vector(1536), -- OpenAI embedding dimension
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Candidate scores table
create table candidate_scores (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(id) on delete cascade,
    total_score decimal not null,
    skills_score decimal not null,
    experience_score decimal not null,
    education_score decimal not null,
    explanation jsonb not null default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes
create index on jobs(org_id);
create index on candidates(job_id);
create index on candidate_scores(candidate_id);
create index on candidates using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table org_credits enable row level security;
alter table users enable row level security;
alter table jobs enable row level security;
alter table candidates enable row level security;
alter table candidate_scores enable row level security;

-- Create policies
-- Organizations: users can only see their own organization
create policy "Users can view their own organization"
    on organizations for select
    using (id in (
        select org_id from users
        where users.id = auth.uid()
    ));

-- Jobs: users can see jobs from their organization
create policy "Users can view their organization's jobs"
    on jobs for select
    using (org_id in (
        select org_id from users
        where users.id = auth.uid()
    ));

create policy "Admin users can insert jobs"
    on jobs for insert
    with check (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.org_id = jobs.org_id
            and users.role = 'admin'
        )
    );

-- Candidates: users can see candidates for their organization's jobs
create policy "Users can view their organization's candidates"
    on candidates for select
    using (job_id in (
        select id from jobs
        where jobs.org_id in (
            select org_id from users
            where users.id = auth.uid()
        )
    ));

-- Create RPC function for creating jobs
create or replace function create_job(
    p_title text,
    p_description text,
    p_requirements text[]
) returns uuid as $$
declare
    v_org_id uuid;
    v_credits integer;
    v_job_id uuid;
begin
    -- Get the user's organization
    select org_id into v_org_id
    from users
    where id = auth.uid();
    
    -- Check if organization has credits
    select credits into v_credits
    from org_credits
    where org_id = v_org_id;
    
    if v_credits <= 0 then
        raise exception 'No credits available';
    end if;
    
    -- Create the job
    insert into jobs (org_id, title, description, requirements, status, created_by)
    values (v_org_id, p_title, p_description, p_requirements, 'published', auth.uid())
    returning id into v_job_id;
    
    -- Deduct credit
    update org_credits
    set credits = credits - 1
    where org_id = v_org_id;
    
    return v_job_id;
end;
$$ language plpgsql security definer; 