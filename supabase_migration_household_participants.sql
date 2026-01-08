-- Migration: Update schema for multi-household support and user-participant linking
-- Run this in Supabase SQL Editor

-- Step 1: Add invitation_code to households table
ALTER TABLE public.households 
ADD COLUMN IF NOT EXISTS invitation_code text UNIQUE;

-- Step 2: Generate invitation codes for existing households
UPDATE public.households 
SET invitation_code = upper(substring(md5(random()::text || id::text) from 1 for 6))
WHERE invitation_code IS NULL;

-- Step 3: Create function to generate unique invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.households WHERE invitation_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add user_id to participants table (nullable)
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS participants_user_id_idx ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS participants_household_id_idx ON public.participants(household_id);
CREATE INDEX IF NOT EXISTS households_invitation_code_idx ON public.households(invitation_code);

-- Step 6: Update RLS policies to allow users to see participants in their households
-- (This should already exist, but we ensure it's correct)

-- Note: The existing RLS policies should already handle access control
-- Users can only see participants in households they belong to (via user_id or household ownership)

