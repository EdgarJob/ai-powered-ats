import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import config from './config';

// Regular client with anon key for public operations
export const supabase = createClient<Database>(config.supabaseUrl, config.supabaseAnonKey);

// Admin client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(config.supabaseUrl, config.supabaseServiceKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Error | null): string => {
    if (!error) return '';
    
    // Log error in development
    if (config.environment === 'development') {
        console.error('Supabase Error:', error);
    }

    return error.message || 'An unexpected error occurred';
}; 