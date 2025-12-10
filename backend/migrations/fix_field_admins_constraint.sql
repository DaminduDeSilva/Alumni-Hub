-- Fix field_admins table constraint issue
-- Remove the unique constraint on field column and keep only the conditional unique index

-- First, drop the existing unique constraint on field column
ALTER TABLE field_admins DROP CONSTRAINT IF EXISTS field_admins_field_key;

-- Ensure we have the conditional unique index for active field admins
DROP INDEX IF EXISTS unique_active_field_admin;
CREATE UNIQUE INDEX unique_active_field_admin 
ON field_admins (field) 
WHERE is_active = true;

-- Also ensure we can have multiple records for the same user-field combination
-- (one active, multiple inactive for history)
DROP INDEX IF EXISTS unique_user_field_combo;
CREATE UNIQUE INDEX unique_user_field_combo 
ON field_admins (user_id, field) 
WHERE is_active = true;
