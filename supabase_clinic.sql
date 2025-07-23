-- USERS
create table if not exists users (
    id uuid primary key default gen_random_uuid (),
    username text unique not null,
    password_hash text not null,
    is_active boolean not null default true,
    last_login timestamptz,
    created_by uuid references users(id) on delete cascade,
    created_at timestamp with time zone default now (),
    updated_at timestamp with time zone default now ()
);

-- PERMISSIONS
create table if not exists permissions (
    id uuid primary key default gen_random_uuid (),
    name text unique not null
);

-- USER_PERMISSIONS
create table if not exists user_has_permissions (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references users (id) on delete cascade,
    permission_id uuid references permissions (id) on delete cascade,
    created_at timestamptz default now (),
    updated_at timestamptz default now (),
    constraint unique_user_permission unique (user_id, permission_id)
);

-- ROLES
create table if not exists roles (
    id uuid primary key default gen_random_uuid (),
    name text not null unique,
    description text,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- USER_ROLES
create table if not exists user_has_roles (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references users (id) on delete cascade,
    role_id uuid references roles (id) on delete cascade,
    created_at timestamptz default now (),
    updated_at timestamptz default now (),
    constraint unique_user_role unique (user_id, role_id)
);

-- PAGES
create table if not exists pages (
    id uuid primary key default gen_random_uuid (),
    title text not null,
    slug text not null unique,
    content text not null,
    meta_description text,
    is_published boolean default false,
    created_by uuid references users (id),
    survey_id uuid references surveys (id),
    doctors_category text,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- MENU ITEMS
create table if not exists menu_items (
    id uuid primary key default gen_random_uuid (),
    title text not null,
    url text,
    order_position integer not null,
    parent_id uuid references menu_items (id),
    is_published boolean default false,
    created_by uuid references users (id),
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- DOCTORS
create table if not exists doctors (
    id uuid primary key default gen_random_uuid (),
    first_name text not null,
    last_name text not null,
    specialization text not null,
    bio text,
    schedule text not null,
    is_active boolean default true,
    image_url text,
    order_position integer not null default 1,
    menu_category text not null default 'lekarze',
    page_id uuid references pages (id) on delete cascade,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- NEWS
create table if not exists news (
    id uuid primary key default gen_random_uuid (),
    title text not null,
    content text not null,
    is_published boolean not null default false,
    published_at timestamptz,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- NEWS CATEGORY
create table if not exists news_category (
    id uuid primary key default gen_random_uuid (),
    name text not null unique,
    description text,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- NEWS HAS CATEGORY
create table if not exists news_has_category (
    id uuid primary key default gen_random_uuid (),
    news_id uuid not null references news (id) on delete cascade,
    category_id uuid not null references news_category (id) on delete cascade,
    created_at timestamptz default now (),
    updated_at timestamptz default now (),
    constraint unique_news_category unique (news_id, category_id)
);

-- PAGE SETTINGS
create table if not exists page_settings (
    id uuid primary key default gen_random_uuid (),
    title text not null,
    content text not null,
    subtitle text,
    hero_image text,
    survey_id uuid references surveys(id) on delete
    set
        null,
        created_at timestamptz default now (),
        updated_at timestamptz default now ()
);

-- SERVICES
create table if not exists services (
    id uuid primary key default gen_random_uuid (),
    title text not null,
    description text not null,
    is_published boolean default false,
    icon text not null,
    created_at timestamptz default now (),
    updated_at timestamptz default now ()
);

-- CONTACT DETAILS
create table if not exists contact_details (
    id uuid primary key default gen_random_uuid(),
    group_id uuid references contact_groups(id) on delete
    set
        null,
        type text not null check (
            type in (
                'phone',
                'email',
                'address',
                'hours',
                'emergency_contact'
            )
        ),
        value text not null,
        order_position integer not null default 1,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
);

-- CONTACT GROUPS
create table if not exists contact_groups (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    in_hero boolean not null default false,
    in_footer boolean not null default false,
    order_position integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- SURVEYS
create table if not exists surveys (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    is_published boolean default false,
    created_by uuid references users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- QUESTIONS
create table if not exists question_has_survey (
    id uuid primary key default gen_random_uuid(),
    survey_id uuid not null references surveys(id) on delete cascade,
    text text not null,
    type text not null check (type in ('single', 'multi', 'text')),
    order_no integer not null default 0
);

-- QUESTION OPTIONS
create table if not exists option_has_question (
    id uuid primary key default gen_random_uuid(),
    question_id uuid not null references question_has_survey(id) on delete cascade,
    text text not null,
    order_no integer not null default 0
);

-- SURVEY ANSWERS
create table if not exists survey_answers (
    id uuid primary key default gen_random_uuid(),
    survey_id uuid not null references surveys(id) on delete cascade,
    question_id uuid not null references question_has_survey(id),
    option_id uuid references option_has_question(id),
    answer_text text,
    response_id uuid not null,
    submitted_at timestamptz not null default now()
);

-- SITE SETTINGS
create table if not exists site_settings (
    id uuid primary key default gen_random_uuid(),
    key text unique not null,
    value text,
    description text,
    created_by uuid references users(id) on delete
    set
        null,
        updated_by uuid references users(id) on delete
    set
        null,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
);

-- DATABASE BACKUPS
create table if not exists database_backups (
    id uuid primary key default gen_random_uuid (),
    filename text not null,
    file_path text not null,
    file_size bigint not null default 0,
    backup_type text not null default 'manual',
    status text not null default 'in_progress',
    error_message text,
    created_by uuid references users(id) on delete
    set
        null,
        created_at timestamptz default now (),
        completed_at timestamptz
);