-- Alter public.challenges table to add ideal resource metrics columns
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS ideal_water_ml NUMERIC;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS ideal_co2_grams NUMERIC;
