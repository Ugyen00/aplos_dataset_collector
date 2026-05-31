-- Run this in your Supabase SQL editor

-- Sentences table
create table if not exists sentences (
  id serial primary key,
  sentence text not null,
  char_count integer,
  token_count integer,
  created_at timestamptz default now()
);

-- Recordings table
create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  sentence_id integer references sentences(id) on delete cascade,
  speaker_name text not null,
  audio_url text not null,
  duration_ms integer,
  created_at timestamptz default now()
);

-- Index for fast lookup
create index if not exists recordings_sentence_id_idx on recordings(sentence_id);
create index if not exists recordings_speaker_name_idx on recordings(speaker_name);

-- Storage bucket (run this too)
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', true)
on conflict do nothing;

-- Storage policy: allow all reads
drop policy if exists "Public read access" on storage.objects;
create policy "Public read access"
on storage.objects for select
using (bucket_id = 'recordings');

-- Storage policy: allow all uploads
drop policy if exists "Allow uploads" on storage.objects;
create policy "Allow uploads"
on storage.objects for insert
with check (bucket_id = 'recordings');

-- Enable RLS
alter table sentences enable row level security;
alter table recordings enable row level security;

-- Allow all access (you can tighten this later with auth)
drop policy if exists "Allow all" on sentences;
create policy "Allow all" on sentences for all using (true);

drop policy if exists "Allow all" on recordings;
create policy "Allow all" on recordings for all using (true);

-- ============================================================
-- ENGLISH → KURTAP & TSHANGLA (Translate + Record)
-- ============================================================

-- Shared English source sentences (used by both Kurtap & Tshangla)
create table if not exists english_sentences (
  id serial primary key,
  sentence text not null,
  char_count integer,
  token_count integer,
  created_at timestamptz default now()
);

-- Kurtap recordings: stores typed Kurtap translation + audio
create table if not exists kurtap_recordings (
  id uuid primary key default gen_random_uuid(),
  sentence_id integer references english_sentences(id) on delete cascade,
  speaker_name text not null,
  english_sentence text,
  translated_text text not null,
  audio_url text not null,
  duration_ms integer,
  created_at timestamptz default now()
);

-- Tshangla recordings: stores typed Tshangla translation + audio
create table if not exists tshangla_recordings (
  id uuid primary key default gen_random_uuid(),
  sentence_id integer references english_sentences(id) on delete cascade,
  speaker_name text not null,
  english_sentence text,
  translated_text text not null,
  audio_url text not null,
  duration_ms integer,
  created_at timestamptz default now()
);

-- Migration: add english_sentence column if tables already exist
alter table kurtap_recordings add column if not exists english_sentence text;
alter table tshangla_recordings add column if not exists english_sentence text;

-- Indexes for fast lookup
create index if not exists kurtap_recordings_sentence_id_idx on kurtap_recordings(sentence_id);
create index if not exists kurtap_recordings_speaker_name_idx on kurtap_recordings(speaker_name);
create index if not exists tshangla_recordings_sentence_id_idx on tshangla_recordings(sentence_id);
create index if not exists tshangla_recordings_speaker_name_idx on tshangla_recordings(speaker_name);

-- Storage bucket policy: allow uploads under kurtap/ and tshangla/ prefixes
-- (uses the existing 'recordings' bucket)

-- RLS
alter table english_sentences enable row level security;
alter table kurtap_recordings enable row level security;
alter table tshangla_recordings enable row level security;

drop policy if exists "Allow all" on english_sentences;
create policy "Allow all" on english_sentences for all using (true);

drop policy if exists "Allow all" on kurtap_recordings;
create policy "Allow all" on kurtap_recordings for all using (true);

drop policy if exists "Allow all" on tshangla_recordings;
create policy "Allow all" on tshangla_recordings for all using (true);

