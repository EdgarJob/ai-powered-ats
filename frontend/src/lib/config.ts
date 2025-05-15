interface Config {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceKey: string;
    apiUrl: string;
    environment: 'development' | 'production' | 'test';
}

const config: Config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    supabaseServiceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    environment: (import.meta.env.MODE as Config['environment']) || 'development'
};

export default config; 