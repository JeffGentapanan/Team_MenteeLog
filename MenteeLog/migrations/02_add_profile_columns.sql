-- Add missing columns to profiles if they do not exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS supervisor_id uuid REFERENCES profiles(id);
