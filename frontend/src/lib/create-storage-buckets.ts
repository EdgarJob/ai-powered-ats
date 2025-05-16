import { supabaseAdmin } from './supabase';

/**
 * Creates storage buckets for profile pictures and resumes if they don't exist
 */
export async function createRequiredStorageBuckets() {
  try {
    console.log('Checking and creating required storage buckets...');
    
    // Create profile-pictures bucket if it doesn't exist
    const { data: profileBuckets, error: profileError } = await supabaseAdmin.storage.listBuckets();
    
    if (profileError) {
      console.error('Error checking buckets:', profileError);
      return false;
    }
    
    // Check if profile-pictures bucket exists
    const profileBucketExists = profileBuckets?.some(bucket => bucket.name === 'profile-pictures');
    
    if (!profileBucketExists) {
      console.log('Creating profile-pictures bucket...');
      const { error: createProfileError } = await supabaseAdmin.storage.createBucket('profile-pictures', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });
      
      if (createProfileError) {
        console.error('Error creating profile-pictures bucket:', createProfileError);
        return false;
      }
      console.log('profile-pictures bucket created successfully');
    } else {
      console.log('profile-pictures bucket already exists');
    }
    
    // Check if resumes bucket exists
    const resumesBucketExists = profileBuckets?.some(bucket => bucket.name === 'resumes');
    
    if (!resumesBucketExists) {
      console.log('Creating resumes bucket...');
      const { error: createResumesError } = await supabaseAdmin.storage.createBucket('resumes', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (createResumesError) {
        console.error('Error creating resumes bucket:', createResumesError);
        return false;
      }
      console.log('resumes bucket created successfully');
    } else {
      console.log('resumes bucket already exists');
    }
    
    console.log('Storage buckets setup complete');
    return true;
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    return false;
  }
} 