import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import config from './config';

// Log Supabase configuration for debugging
console.log('Initializing Supabase clients with URL:', config.supabaseUrl);

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
            // Add explicit role claim to bypass RLS policies
            headers: { 
                'x-refresh-schema-cache': 'true',
                'Authorization': `Bearer ${config.supabaseServiceKey}`,
                'apikey': config.supabaseServiceKey,
                'x-supabase-role': 'service_role'
            }
        }
    }
);

// Verify admin connection works
supabaseAdmin.from('jobs').select('count').then(({ data, error }) => {
    if (error) {
        console.error('Error connecting to Supabase with admin client:', error);
    } else {
        console.log('Supabase admin client connected successfully. Jobs count:', data?.[0]?.count);
    }
}).catch(err => {
    console.error('Failed to initialize Supabase admin client:', err);
});

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