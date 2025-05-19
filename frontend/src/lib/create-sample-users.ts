import { supabaseAdmin, supabase } from './supabase';

// Sample users based on the fallback candidate data in our system
interface SampleUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
  {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex@example.com',
    password: 'password123',
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@example.com',
    password: 'password123',
  },
  {
    firstName: 'Michael',
    lastName: 'Wong',
    email: 'michael@example.com',
    password: 'password123',
  }
];

/**
 * Creates sample user accounts for demonstration
 */
export async function createSampleUsers(): Promise<{success: boolean, message: string}> {
  try {
    console.log('Creating sample user accounts...');
    let createdCount = 0;
    let errors = [];
    
    // First, create a default organization if it doesn't exist
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert({
        id: 'default-org-id',
        name: 'Default Organization',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('id')
      .single();
    
    if (orgError) {
      console.error('Error creating default organization:', orgError);
      errors.push(`Organization error: ${orgError.message}`);
    }
    
    // Use the organization ID from the result or use the default
    const orgId = orgData?.id || 'default-org-id';
    console.log(`Using organization ID: ${orgId}`);

    // Also create admin user if it doesn't exist
    try {
      const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'admin123',
      });
      
      if (adminError) {
        console.error('Error creating admin user:', adminError);
        errors.push(`Admin user error: ${adminError.message}`);
      } else if (adminData?.user) {
        console.log('Admin user created or exists:', adminData.user.id);
        
        // Set admin role in users table
        await supabaseAdmin
          .from('users')
          .upsert({
            id: adminData.user.id,
            org_id: orgId,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (adminErr) {
      console.error('Exception creating admin:', adminErr);
    }

    // Create regular sample users
    for (const user of SAMPLE_USERS) {
      try {
        console.log(`Attempting to create user: ${user.email}`);
        
        // Create the user in auth system
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
        });

        if (error) {
          console.error(`Error creating user ${user.email}:`, error);
          errors.push(`User ${user.email} error: ${error.message}`);
          continue;
        }

        if (data?.user) {
          console.log(`User created: ${user.email} with ID: ${data.user.id}`);
          
          // Set user role and org_id in users table
          const { error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: data.user.id,
              org_id: orgId,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (userError) {
            console.error(`Error setting role for ${user.email}:`, userError);
            errors.push(`Role setting error for ${user.email}: ${userError.message}`);
          }

          // Also create an entry for user profile data
          const { error: candidateError } = await supabaseAdmin
            .from('candidates')
            .upsert({
              id: data.user.id,
              job_id: 'no-job', // Placeholder
              full_name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: null,
              resume_url: '',
              status: 'pending',
              first_name: user.firstName,
              last_name: user.lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (candidateError) {
            console.error(`Error creating candidate profile for ${user.email}:`, candidateError);
            errors.push(`Candidate profile error for ${user.email}: ${candidateError.message}`);
          }

          createdCount++;
          console.log(`Created user account for ${user.email}`);
        }
      } catch (e) {
        console.error(`Exception creating user ${user.email}:`, e);
        errors.push(`Exception for ${user.email}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Return a detailed result with any errors
    if (errors.length > 0) {
      return {
        success: createdCount > 0,
        message: `Created ${createdCount} out of ${SAMPLE_USERS.length} users. Errors: ${errors.join('; ')}`
      };
    }

    return {
      success: true,
      message: `Successfully created ${createdCount} out of ${SAMPLE_USERS.length} sample users.`
    };

  } catch (error) {
    console.error('Error creating sample users:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error creating sample users'
    };
  }
} 