-- Supabase SQL Script to Reset Users & Database (Start Afresh) 
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/fvtaoeunqeqnuotydrtv/sql)

-- 1. Truncate user attempt scores and profiles
TRUNCATE TABLE public.scores CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. Clear all authentication users (cascading deletes will clear related data)
DELETE FROM auth.users;

-- 3. Reset streaks or user table configurations if needed
ALTER SEQUENCE IF EXISTS public.scores_id_seq RESTART WITH 1;
