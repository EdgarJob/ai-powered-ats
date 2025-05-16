import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import config from './config';

// Regular client with anon key for public operations
export const supabase = createClient<Database>(
    config.supabaseUrl, 
    config.supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        },
        db: {
            schema: 'public'
        },
        global: {
            // Force refresh of schema cache - resolves the "column not found in schema cache" error
            headers: { 'x-refresh-schema-cache': 'true' }
        }
    }
);

// Admin client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(
    config.supabaseUrl, 
    config.supabaseServiceKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        },
        db: {
            schema: 'public'
        },
        global: {
            // Force refresh of schema cache - resolves the "column not found in schema cache" error
            headers: { 'x-refresh-schema-cache': 'true' }
        }
    }
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Error | null): string => {
    if (!error) return '';
    
    // Log error in development
    if (config.environment === 'development') {
        console.error('Supabase Error:', error);
    }

    return error.message || 'An unexpected error occurred';
};

// Function to refresh schema cache - call this when you hit schema cache issues
export async function refreshSchemaCache() {
    console.log('Attempting to refresh Supabase schema cache...');
    try {
        // Make a request with the special header
        await supabaseAdmin.from('jobs').select('id').limit(1).single();
        console.log('Schema cache refresh attempted');
    } catch (err) {
        console.error('Error during schema cache refresh:', err);
    }
} 