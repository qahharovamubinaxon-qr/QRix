-- Migration: add user_id foreign key to dynamic_links
ALTER TABLE dynamic_links
ADD COLUMN user_id uuid REFERENCES auth.users(id);
