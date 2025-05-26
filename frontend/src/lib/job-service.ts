import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'draft' | 'published' | 'closed';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  employmentType?: string;
  category?: string; // Job category ID (e.g., 'information-technology')
  subcategory?: string; // Specific subcategory (e.g., 'Software Development')
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Create a new job
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
  try {
    const newJob = {
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'jobs'), newJob);

    return {
      id: docRef.id,
      ...newJob
    };
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// Get a job by ID
export async function getJob(jobId: string): Promise<Job | null> {
  try {
    const docRef = doc(db, 'jobs', jobId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Firestore Timestamps to JavaScript Dates
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Job;
    }

    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
}

// Get all jobs with optional filtering
export async function getJobs(options: {
  status?: 'draft' | 'published' | 'closed';
  createdBy?: string;
} = {}): Promise<Job[]> {
  try {
    const jobsQuery = collection(db, 'jobs');
    const constraints = [];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options.createdBy) {
      constraints.push(where('createdBy', '==', options.createdBy));
    }

    // Always sort by creation date, descending
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(jobsQuery, ...constraints);
    const querySnapshot = await getDocs(q);

    const jobs: Job[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Job);
    });

    return jobs;
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
}

// Update a job
export async function updateJob(jobId: string, jobData: Partial<Omit<Job, 'id' | 'createdAt' | 'createdBy'>>): Promise<Job> {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    const updateData = {
      ...jobData,
      updatedAt: new Date()
    };

    await updateDoc(jobRef, updateData);

    // Get the updated job
    const updatedJob = await getJob(jobId);
    if (!updatedJob) {
      throw new Error(`Job with ID ${jobId} not found after update`);
    }

    return updatedJob;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

// Delete a job
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
} 