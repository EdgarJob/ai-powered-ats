import { supabaseAdmin } from './supabase';
import { refreshSchemaCache } from './supabase';

/**
 * Creates SQL helper functions in the database if they don't exist already
 */
export async function createSqlHelperFunctions() {
    try {
        // Create a function to execute arbitrary SQL
        try {
            await supabaseAdmin.rpc('create_execute_sql_function');
        } catch {
            // Create the function if it doesn't exist yet
            await supabaseAdmin.rpc('create_function', {
                function_name: 'execute_sql',
                function_definition: `
                CREATE OR REPLACE FUNCTION execute_sql(sql text)
                RETURNS void
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                BEGIN
                    EXECUTE sql;
                END;
                $$;
                `
            });
        }

        // Create a function to check if a column exists
        try {
            await supabaseAdmin.rpc('check_column_exists', {
                table_name: 'jobs',
                column_name: 'id'
            });
        } catch {
            // Create the function if it doesn't exist yet
            await supabaseAdmin.rpc('create_function', {
                function_name: 'check_column_exists',
                function_definition: `
                CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
                RETURNS boolean
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                DECLARE
                    exists_bool boolean;
                BEGIN
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = $1
                        AND column_name = $2
                    ) INTO exists_bool;
                    RETURN exists_bool;
                END;
                $$;
                `
            });
        }

        // Create a function to create other functions
        try {
            await supabaseAdmin.rpc('create_function', {
                function_name: 'create_function',
                function_definition: `
                CREATE OR REPLACE FUNCTION create_function(function_name text, function_definition text)
                RETURNS void
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                BEGIN
                    EXECUTE function_definition;
                END;
                $$;
                `
            });
        } catch (error: unknown) {
            console.log('Function create_function might already exist', error);
        }

        console.log('SQL helper functions created successfully');
        return true;
    } catch (error) {
        console.error('Error creating SQL helper functions:', error);
        return false;
    }
}

/**
 * Creates a stored procedure to handle responsibilities updates
 */
export async function createResponsibilitiesFunction() {
    try {
        // Create a database function to update responsibilities
        console.log('Creating responsibilities update function...');
        await supabaseAdmin.rpc('create_function', {
            function_name: 'update_job_responsibilities',
            function_definition: `
            CREATE OR REPLACE FUNCTION update_job_responsibilities(p_job_id UUID, p_responsibilities TEXT)
            RETURNS VOID
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
                UPDATE jobs 
                SET responsibilities = p_responsibilities
                WHERE id = p_job_id;
            END;
            $$;
            `
        });
        
        console.log('Responsibilities update function created');
        return true;
    } catch (error) {
        console.error('Failed to create responsibilities function:', error);
        return false;
    }
}

/**
 * Adds a metadata JSONB column to the jobs table if it doesn't exist
 */
export async function addMetadataColumnToJobs() {
    try {
        // First create the helper functions
        await createSqlHelperFunctions();
        
        console.log('Checking for metadata column in jobs table...');

        // Check if the column exists
        const { data: exists, error: checkError } = await supabaseAdmin.rpc('check_column_exists', {
            table_name: 'jobs',
            column_name: 'metadata'
        });

        if (checkError) {
            console.error('Error checking for column:', checkError);
            // Try a direct approach as fallback
            try {
                await supabaseAdmin.from('jobs').select('metadata').limit(1);
                console.log('Metadata column exists (verified by query)');
                return true;
            } catch (queryError) {
                console.error('Error querying metadata column:', queryError);
            }
        }

        if (!exists) {
            console.log('Metadata column does not exist, attempting to add it...');
            
            // Try multiple approaches to add the column
            try {
                // Method 1: Using RPC
                await supabaseAdmin.rpc('execute_sql', {
                    sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\''
                });
                console.log('Metadata column added to jobs table via RPC');
            } catch (error1) {
                console.error('Error adding metadata column via RPC:', error1);
                
                // Method 2: Try direct SQL if available
                try {
                    await supabaseAdmin.from('_exec_sql').select('*').eq('query', 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'');
                    console.log('Metadata column added to jobs table via direct SQL');
                } catch (error2) {
                    console.error('Error adding metadata column via direct SQL:', error2);
                    console.log('Could not add metadata column - will use localStorage fallback');
                }
            }
        } else {
            console.log('Metadata column already exists in jobs table');
        }

        return true;
    } catch (error) {
        console.error('Error adding metadata column:', error);
        console.log('Using localStorage fallback for metadata');
        return false;
    }
}

/**
 * Adds a responsibilities text column to the jobs table if it doesn't exist
 */
export async function addResponsibilitiesColumn() {
    try {
        // First create the helper functions
        await createSqlHelperFunctions();
        await createResponsibilitiesFunction();
        
        console.log('Checking for responsibilities column in jobs table...');

        // Check if the column exists
        const { data: exists, error: checkError } = await supabaseAdmin.rpc('check_column_exists', {
            table_name: 'jobs',
            column_name: 'responsibilities'
        });

        if (checkError) {
            console.error('Error checking for responsibilities column:', checkError);
            // Try a direct approach as fallback
            try {
                await supabaseAdmin.from('jobs').select('responsibilities').limit(1);
                console.log('Responsibilities column exists (verified by query)');
                return true;
            } catch (queryError) {
                console.error('Error querying responsibilities column:', queryError);
            }
        }

        if (!exists) {
            console.log('Responsibilities column does not exist, attempting to add it...');
            
            // Try multiple approaches to add the column
            try {
                // Method 1: Using RPC
                await supabaseAdmin.rpc('execute_sql', {
                    sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT'
                });
                console.log('Responsibilities column added to jobs table via RPC');
                return true;
            } catch (error1) {
                console.error('Error adding responsibilities column via RPC:', error1);
                
                // Method 2: Try direct SQL if available
                try {
                    await supabaseAdmin.from('_exec_sql').select('*').eq('query', 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT');
                    console.log('Responsibilities column added to jobs table via direct SQL');
                    return true;
                } catch (error2) {
                    console.error('Error adding responsibilities column via direct SQL:', error2);
                    console.log('Could not add responsibilities column - will use metadata/localStorage fallback');
                }
            }
        } else {
            console.log('Responsibilities column already exists in jobs table');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error adding responsibilities column:', error);
        console.log('Using metadata/localStorage fallback for responsibilities');
        return false;
    }
}

/**
 * Adds a bio text column to the candidates table if it doesn't exist
 */
export async function addBioColumnToCandidates() {
    try {
        // First create the helper functions
        await createSqlHelperFunctions();
        
        console.log('Checking for bio column in candidates table...');

        // Check if the column exists
        const { data: exists, error: checkError } = await supabaseAdmin.rpc('check_column_exists', {
            table_name: 'candidates',
            column_name: 'bio'
        });

        if (checkError) {
            console.error('Error checking for bio column:', checkError);
            // Try a direct approach as fallback
            try {
                await supabaseAdmin.from('candidates').select('bio').limit(1);
                console.log('Bio column exists (verified by query)');
                return true;
            } catch (queryError) {
                console.error('Error querying bio column:', queryError);
            }
        }

        if (!exists) {
            console.log('Bio column does not exist, attempting to add it...');
            
            // Try multiple approaches to add the column
            try {
                // Method 1: Using RPC
                await supabaseAdmin.rpc('execute_sql', {
                    sql: 'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS bio TEXT'
                });
                console.log('Bio column added to candidates table via RPC');
                return true;
            } catch (error1) {
                console.error('Error adding bio column via RPC:', error1);
                
                // Method 2: Try direct SQL if available
                try {
                    await supabaseAdmin.from('_exec_sql').select('*').eq('query', 'ALTER TABLE candidates ADD COLUMN IF NOT EXISTS bio TEXT');
                    console.log('Bio column added to candidates table via direct SQL');
                    return true;
                } catch (error2) {
                    console.error('Error adding bio column via direct SQL:', error2);
                    console.log('Could not add bio column to candidates table');
                }
            }
        } else {
            console.log('Bio column already exists in candidates table');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error adding bio column to candidates table:', error);
        return false;
    }
}

/**
 * Updates the candidates table schema to add all required columns
 */
export async function updateCandidatesTableSchema() {
    try {
        // First create the helper functions
        await createSqlHelperFunctions();
        
        console.log('Updating candidates table schema...');
        
        // List of columns to add with their data types
        const columnsToAdd = {
            'first_name': 'TEXT',
            'last_name': 'TEXT',
            'bio': 'TEXT',
            'gender': 'TEXT',
            'location': 'TEXT',
            'date_of_birth': 'DATE',
            'profile_picture_url': 'TEXT',
            'education_level': 'TEXT',
            'certifications': 'JSONB DEFAULT \'[]\'::jsonb',
            'employment_history': 'JSONB DEFAULT \'[]\'::jsonb',
            'current_salary': 'NUMERIC',
            'salary_currency': 'TEXT'
        };
        
        let successCount = 0;
        
        // Check and add each column
        for (const [columnName, dataType] of Object.entries(columnsToAdd)) {
            try {
                // Check if the column exists
                const { data: exists, error: checkError } = await supabaseAdmin.rpc('check_column_exists', {
                    table_name: 'candidates',
                    column_name: columnName
                });
                
                if (checkError) {
                    console.error(`Error checking for ${columnName} column:`, checkError);
                    // Try a direct approach as fallback
                    try {
                        await supabaseAdmin.from('candidates').select(columnName).limit(1);
                        console.log(`${columnName} column exists (verified by query)`);
                        successCount++;
                        continue;
                    } catch (queryError) {
                        console.error(`Error querying ${columnName} column:`, queryError);
                    }
                }
                
                if (!exists) {
                    console.log(`${columnName} column does not exist, attempting to add it...`);
                    
                    // Try to add the column
                    try {
                        // Using RPC
                        await supabaseAdmin.rpc('execute_sql', {
                            sql: `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ${columnName} ${dataType}`
                        });
                        console.log(`${columnName} column added to candidates table via RPC`);
                        successCount++;
                    } catch (error1) {
                        console.error(`Error adding ${columnName} column via RPC:`, error1);
                        
                        // Try direct SQL as fallback
                        try {
                            await supabaseAdmin.from('_exec_sql').select('*').eq('query', `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ${columnName} ${dataType}`);
                            console.log(`${columnName} column added to candidates table via direct SQL`);
                            successCount++;
                        } catch (error2) {
                            console.error(`Error adding ${columnName} column via direct SQL:`, error2);
                            console.log(`Could not add ${columnName} column to candidates table`);
                        }
                    }
                } else {
                    console.log(`${columnName} column already exists in candidates table`);
                    successCount++;
                }
            } catch (columnError) {
                console.error(`Error processing ${columnName} column:`, columnError);
            }
        }
        
        console.log(`Successfully processed ${successCount} out of ${Object.keys(columnsToAdd).length} columns`);
        
        // Refresh schema cache to recognize new columns
        try {
            await refreshSchemaCache();
        } catch (refreshError) {
            console.error('Error refreshing schema cache:', refreshError);
        }
        
        return successCount > 0;
    } catch (error) {
        console.error('Error updating candidates table schema:', error);
        return false;
    }
} 