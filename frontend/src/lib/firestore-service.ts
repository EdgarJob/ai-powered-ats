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
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  experience: string;
  education: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id?: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

// Jobs Collection
export const jobsCollection = collection(db, 'jobs');

// Get all jobs
export const getJobs = async (): Promise<Job[]> => {
  const q = query(jobsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};

// Get a single job
export const getJob = async (id: string): Promise<Job | null> => {
  const docRef = doc(db, 'jobs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Job;
  }
  return null;
};

// Add a new job
export const addJob = async (job: Omit<Job, 'id'>): Promise<string> => {
  const docRef = await addDoc(jobsCollection, {
    ...job,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Update a job
export const updateJob = async (id: string, job: Partial<Job>): Promise<void> => {
  const docRef = doc(db, 'jobs', id);
  await updateDoc(docRef, {
    ...job,
    updatedAt: new Date()
  });
};

// Delete a job
export const deleteJob = async (id: string): Promise<void> => {
  const docRef = doc(db, 'jobs', id);
  await deleteDoc(docRef);
};

// Candidates Collection
export const candidatesCollection = collection(db, 'candidates');

// Get all candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  const q = query(candidatesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
};

// Get a single candidate
export const getCandidate = async (id: string): Promise<Candidate | null> => {
  const docRef = doc(db, 'candidates', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Candidate;
  }
  return null;
};

// Add a new candidate
export const addCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<string> => {
  const docRef = await addDoc(candidatesCollection, {
    ...candidate,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Update a candidate
export const updateCandidate = async (id: string, candidate: Partial<Candidate>): Promise<void> => {
  const docRef = doc(db, 'candidates', id);
  await updateDoc(docRef, {
    ...candidate,
    updatedAt: new Date()
  });
};

// Delete a candidate
export const deleteCandidate = async (id: string): Promise<void> => {
  const docRef = doc(db, 'candidates', id);
  await deleteDoc(docRef);
};

// Job Applications Collection
export const applicationsCollection = collection(db, 'applications');

// Get all applications for a job
export const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  const q = query(
    applicationsCollection,
    where('jobId', '==', jobId),
    orderBy('appliedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
};

// Get all applications for a candidate
export const getCandidateApplications = async (candidateId: string): Promise<JobApplication[]> => {
  const q = query(
    applicationsCollection,
    where('candidateId', '==', candidateId),
    orderBy('appliedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
};

// Add a new application
export const addApplication = async (application: Omit<JobApplication, 'id'>): Promise<string> => {
  const docRef = await addDoc(applicationsCollection, {
    ...application,
    appliedAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Update an application
export const updateApplication = async (id: string, application: Partial<JobApplication>): Promise<void> => {
  const docRef = doc(db, 'applications', id);
  await updateDoc(docRef, {
    ...application,
    updatedAt: new Date()
  });
}; 