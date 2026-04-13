-- Migration: Add tutor fields to usuarios table
-- Execute this SQL in your Supabase SQL Editor

-- Add es_tutor column (boolean, default false)
ALTER TABLE usuarios
ADD COLUMN es_tutor BOOLEAN DEFAULT FALSE;

-- Add skills column (text, nullable)
ALTER TABLE usuarios
ADD COLUMN skills TEXT;

-- Add comment for documentation
COMMENT ON COLUMN usuarios.es_tutor IS 'Indicates if the user is a tutor';
COMMENT ON COLUMN usuarios.skills IS 'Comma-separated list of tutor skills/specialties';