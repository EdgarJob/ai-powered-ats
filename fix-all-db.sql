-- Script to completely clean up the database

-- Function to drop all tables in the public schema
CREATE OR REPLACE FUNCTION drop_all_tables()
RETURNS void AS $$
DECLARE
    stmt TEXT;
BEGIN
    -- Disable all triggers first
    FOR stmt IN 
        SELECT 'ALTER TABLE ' || quote_ident(tablename) || ' DISABLE TRIGGER ALL;' 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE stmt;
    END LOOP;
    
    -- Drop all foreign key constraints
    FOR stmt IN 
        SELECT 'ALTER TABLE ' || quote_ident(nspname) || '.' || quote_ident(relname) || 
               ' DROP CONSTRAINT ' || quote_ident(conname) || ';'
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE con.contype = 'f' AND nsp.nspname = 'public'
    LOOP
        EXECUTE stmt;
    END LOOP;
    
    -- Drop all tables
    FOR stmt IN 
        SELECT 'DROP TABLE IF EXISTS ' || quote_ident(tablename) || ' CASCADE;' 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE stmt;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT drop_all_tables();

-- Drop the function itself
DROP FUNCTION IF EXISTS drop_all_tables();

-- Explicitly drop problematic tables in case they weren't caught
DO $$
BEGIN
    DROP TABLE IF EXISTS candidate_scores CASCADE;
    DROP TABLE IF EXISTS candidates CASCADE;
    DROP TABLE IF EXISTS jobs CASCADE;
    DROP TABLE IF EXISTS org_credits CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS organizations CASCADE;
    DROP TABLE IF EXISTS job_applications CASCADE;
    DROP TABLE IF EXISTS candidate_resumes CASCADE;
    DROP TABLE IF EXISTS auth.users CASCADE;
    
    RAISE NOTICE 'All tables have been dropped';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END
$$; 