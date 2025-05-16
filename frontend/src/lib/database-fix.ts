import config from './config';
import { supabaseAdmin } from './supabase';

/**
 * Uses direct fetch API calls to create the execute_sql function and add the responsibilities column
 * This bypasses Supabase client issues with schema cache
 */
export async function fixDatabase() {
  try {
    console.log('Starting database fix...');
    
    // First create the execute_sql function if it doesn't exist
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_command text) RETURNS jsonb AS $$
      DECLARE
        result jsonb;
      BEGIN
        EXECUTE sql_command INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        -- Return the error as a JSON object
        RETURN jsonb_build_object('error', SQLERRM);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Direct REST API call to create the function
    const functionResponse = await fetch(`${config.supabaseUrl}/rest/v1/rpc/postgres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseServiceKey}`
      },
      body: JSON.stringify({
        command: createFunctionSQL
      })
    });
    
    if (!functionResponse.ok) {
      console.error('Error creating execute_sql function:', await functionResponse.text());
    } else {
      console.log('execute_sql function created or already exists');
    }
    
    // Now add the responsibilities column
    const addColumnSQL = `
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS responsibilities TEXT;
    `;
    
    // Direct REST API call to add the column
    const columnResponse = await fetch(`${config.supabaseUrl}/rest/v1/rpc/postgres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseServiceKey}`
      },
      body: JSON.stringify({
        command: addColumnSQL
      })
    });
    
    if (!columnResponse.ok) {
      console.error('Error adding responsibilities column:', await columnResponse.text());
    } else {
      console.log('responsibilities column added or already exists');
    }
    
    // Test if the column works
    const testSQL = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'responsibilities';
    `;
    
    const testResponse = await fetch(`${config.supabaseUrl}/rest/v1/rpc/postgres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseServiceKey}`
      },
      body: JSON.stringify({
        command: testSQL
      })
    });
    
    if (!testResponse.ok) {
      console.error('Error testing column:', await testResponse.text());
      return false;
    } 
    
    const result = await testResponse.json();
    console.log('Column test result:', result);
    
    // Check if the column exists
    if (Array.isArray(result) && result.length > 0) {
      console.log('responsibilities column exists and is ready to use');
      return true;
    } else {
      console.log('Column test failed - column may not exist');
      return false;
    }
  } catch (error) {
    console.error('Database fix failed:', error);
    return false;
  }
}

/**
 * Function to migrate responsibilities from metadata/localStorage to the responsibilities column
 * Returns an object with counts of operations
 */
export async function migrateAllResponsibilities() {
  try {
    console.log('Starting responsibilities migration...');
    
    // First ensure the column exists
    await fixDatabase();
    
    // Get all jobs
    const { data: jobs, error: fetchError } = await supabaseAdmin
      .from('jobs')
      .select('id, responsibilities, metadata');
    
    if (fetchError) {
      console.error('Error fetching jobs:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found to migrate');
      return { success: true, migrated: 0, total: 0 };
    }
    
    console.log(`Found ${jobs.length} jobs to check for migration`);
    let migratedCount = 0;
    let alreadyGoodCount = 0;
    
    // Process each job
    for (const job of jobs) {
      // Skip if already has responsibilities directly
      if (job.responsibilities) {
        console.log(`Job ${job.id} already has responsibilities: "${job.responsibilities.substring(0, 50)}..."`);
        alreadyGoodCount++;
        continue;
      }
      
      let responsibilitiesToMigrate = null;
      
      // Check metadata first
      if (job.metadata) {
        try {
          // Parse if it's a string
          const metadata = typeof job.metadata === 'string' 
            ? JSON.parse(job.metadata) 
            : job.metadata;
          
          if (metadata && metadata.responsibilities) {
            responsibilitiesToMigrate = metadata.responsibilities;
            console.log(`Found responsibilities in metadata for job ${job.id}`);
          }
        } catch (parseError) {
          console.error(`Error parsing metadata for job ${job.id}:`, parseError);
        }
      }
      
      // Check localStorage if not found in metadata
      if (!responsibilitiesToMigrate) {
        try {
          // Check dedicated responsibilities key
          const localRespData = localStorage.getItem(`job_${job.id}_responsibilities`);
          if (localRespData) {
            try {
              const respObj = JSON.parse(localRespData);
              if (respObj && respObj.responsibilities) {
                responsibilitiesToMigrate = respObj.responsibilities;
                console.log(`Found responsibilities in dedicated localStorage for job ${job.id}`);
              }
            } catch (e) {
              console.error(`Error parsing dedicated localStorage for job ${job.id}:`, e);
            }
          }
          
          // Check general metadata from localStorage
          if (!responsibilitiesToMigrate) {
            const localMetadata = localStorage.getItem(`job_${job.id}_metadata`);
            if (localMetadata) {
              try {
                const metadata = JSON.parse(localMetadata);
                if (metadata && metadata.responsibilities) {
                  responsibilitiesToMigrate = metadata.responsibilities;
                  console.log(`Found responsibilities in localStorage metadata for job ${job.id}`);
                }
              } catch (e) {
                console.error(`Error parsing localStorage metadata for job ${job.id}:`, e);
              }
            }
          }
        } catch (localStorageError) {
          console.error(`Error retrieving data from localStorage for job ${job.id}:`, localStorageError);
        }
      }
      
      // If we found responsibilities, update the job
      if (responsibilitiesToMigrate) {
        console.log(`Migrating responsibilities for job ${job.id}: "${responsibilitiesToMigrate.substring(0, 50)}..."`);
        
        let migrationSuccess = false;
        
        // Try method 1: Standard Supabase update
        try {
          const { error: updateError } = await supabaseAdmin
            .from('jobs')
            .update({ responsibilities: responsibilitiesToMigrate })
            .eq('id', job.id);
          
          if (!updateError) {
            console.log(`Method 1: Successfully migrated responsibilities for job ${job.id}`);
            migrationSuccess = true;
          } else {
            console.error(`Method 1 failed for job ${job.id}:`, updateError);
          }
        } catch (err) {
          console.error(`Method 1 exception for job ${job.id}:`, err);
        }
        
        // If method 1 failed, try method 2: Direct SQL
        if (!migrationSuccess) {
          try {
            // Escape single quotes for SQL
            const escapedText = responsibilitiesToMigrate.replace(/'/g, "''");
            const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
              sql: `UPDATE jobs SET responsibilities = '${escapedText}' WHERE id = '${job.id}'`
            });
            
            if (!sqlError) {
              console.log(`Method 2: Successfully migrated responsibilities for job ${job.id}`);
              migrationSuccess = true;
            } else {
              console.error(`Method 2 failed for job ${job.id}:`, sqlError);
            }
          } catch (sqlErr) {
            console.error(`Method 2 exception for job ${job.id}:`, sqlErr);
          }
        }
        
        // If successful, increment counter
        if (migrationSuccess) {
          migratedCount++;
        }
      } else {
        console.log(`No responsibilities found to migrate for job ${job.id}`);
      }
    }
    
    // Refresh schema cache to ensure changes are available
    try {
      await supabaseAdmin.auth.refreshSession();
    } catch (e) {
      console.error('Error refreshing session:', e);
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} out of ${jobs.length - alreadyGoodCount} jobs that needed migration.`);
    console.log(`${alreadyGoodCount} jobs already had responsibilities properly set.`);
    
    return {
      success: true,
      migrated: migratedCount,
      total: jobs.length,
      alreadyGood: alreadyGoodCount
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Uses direct fetch API calls to add all required columns to the candidates table
 * This bypasses Supabase client issues with schema cache
 */
export async function fixCandidatesTableSchema() {
  try {
    console.log('Starting candidates table schema fix...');
    
    // Define all required columns with their data types
    const columnsToAdd = [
      { name: 'first_name', type: 'TEXT' },
      { name: 'last_name', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'gender', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'profile_picture_url', type: 'TEXT' },
      { name: 'education_level', type: 'TEXT' },
      { name: 'certifications', type: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'employment_history', type: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'current_salary', type: 'NUMERIC' },
      { name: 'salary_currency', type: 'TEXT' }
    ];
    
    // First ensure the execute_sql function exists
    await fixDatabase();
    
    let successCount = 0;
    
    // Add each column to the candidates table
    for (const column of columnsToAdd) {
      const addColumnSQL = `
        ALTER TABLE candidates 
        ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
      `;
      
      // Direct REST API call to add the column
      const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/postgres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseServiceKey}`
        },
        body: JSON.stringify({
          command: addColumnSQL
        })
      });
      
      if (!response.ok) {
        console.error(`Error adding ${column.name} column:`, await response.text());
      } else {
        console.log(`${column.name} column added or already exists`);
        successCount++;
      }
    }
    
    // Test if at least one column worked
    const testSQL = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'candidates' AND column_name = 'bio';
    `;
    
    const testResponse = await fetch(`${config.supabaseUrl}/rest/v1/rpc/postgres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseServiceKey}`
      },
      body: JSON.stringify({
        command: testSQL
      })
    });
    
    console.log(`Successfully added ${successCount} out of ${columnsToAdd.length} columns to candidates table`);
    
    if (!testResponse.ok) {
      console.error('Error testing column:', await testResponse.text());
      return successCount > 0;
    } 
    
    const result = await testResponse.json();
    console.log('Column test result:', result);
    
    // Check if the column exists
    if (Array.isArray(result) && result.length > 0) {
      console.log('bio column exists and other columns should be ready too');
      return true;
    } else {
      console.log('Column test failed - columns may not exist');
      return successCount > 0;
    }
  } catch (error) {
    console.error('Candidates table schema fix failed:', error);
    return false;
  }
} 