-- Tables for configurable onboarding

create table if not exists onboarding_config (
  id integer primary key,
  step2_components text[] not null,
  step3_components text[] not null,
  updated_at timestamp with time zone default now()
);

create table if not exists onboarding (
  user_id uuid primary key,
  email text,
  password text,
  about text,
  street text,
  city text,
  state text,
  zip text,
  birthdate date,
  step int default 1,
  updated_at timestamp with time zone default now()
);

-- Row Level Security can remain off when using service role key from server routes
-- But if you prefer RLS, you'll need appropriate policies.



