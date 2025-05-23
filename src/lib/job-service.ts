import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Job status type (matching your Supabase schema)
export type JobStatus = 'draft' | 'published' | 'closed';

// Job interface (similar to your existing job model)
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  status: JobStatus;
  orgId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    industry?: string;
    location?: string;
    field?: string;
    deadline?: string;
  };
}

// New job data (excludes auto-generated fields)
export interface NewJobData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  status: JobStatus;
  orgId: string;
  createdBy: string;
  metadata?: {
    industry?: string;
    location?: string;
    field?: string;
    deadline?: string;
  };
}

// Get all jobs
export async function getAllJobs(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsCollection);
    
    const jobs: Job[] = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() } as Job);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

// Get published jobs
export async function getPublishedJobs(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(
      jobsCollection, 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    
    const jobsSnapshot = await getDocs(q);
    
    const jobs: Job[] = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() } as Job);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error fetching published jobs:', error);
    throw error;
  }
}

// Get jobs by organization
export async function getJobsByOrganization(orgId: string): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(
      jobsCollection,
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    
    const jobsSnapshot = await getDocs(q);
    
    const jobs: Job[] = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() } as Job);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs by organization:', error);
    throw error;
  }
}

// Get a single job
export async function getJob(jobId: string): Promise<Job | null> {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (jobDoc.exists()) {
      return { id: jobDoc.id, ...jobDoc.data() } as Job;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
}

// Create a new job
export async function createJob(jobData: NewJobData): Promise<Job> {
  try {
    const now = Timestamp.now();
    
    const newJob = {
      ...jobData,
      createdAt: now,
      updatedAt: now
    };
    
    const jobRef = await addDoc(collection(db, 'jobs'), newJob);
    
    return {
      id: jobRef.id,
      ...newJob
    } as Job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// Update a job
export async function updateJob(jobId: string, jobData: Partial<Job>): Promise<void> {
  try {
    const updates = {
      ...jobData,
      updatedAt: Timestamp.now()
    };
    
    // Remove id field if present (can't update document ID)
    if ('id' in updates) {
      delete updates.id;
    }
    
    await updateDoc(doc(db, 'jobs', jobId), updates);
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    throw error;
  }
}

// Delete a job
export async function deleteJob(jobId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    throw error;
  }
} 