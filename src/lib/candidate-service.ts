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
  Timestamp,
  serverTimestamp,
  DocumentReference
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Candidate status type (matching your Supabase schema)
export type CandidateStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected';

// Candidate interface
export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  status: CandidateStatus;
  jobId: string;
  bio?: string;
  location?: string;
  educationLevel?: string;
  employmentHistory?: {
    company: string;
    position: string;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// New candidate data (excludes auto-generated fields)
export interface NewCandidateData {
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  status: CandidateStatus;
  jobId: string;
  bio?: string;
  location?: string;
  educationLevel?: string;
  employmentHistory?: {
    company: string;
    position: string;
    description?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
  }[];
}

// Upload a resume file
export async function uploadResume(userId: string, file: File): Promise<string> {
  // Create a reference to the file location in Firebase Storage
  const resumeRef = ref(storage, `resumes/${userId}/${file.name}`);
  
  // Upload the file
  await uploadBytes(resumeRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(resumeRef);
  
  return downloadURL;
}

// Get all candidates
export async function getAllCandidates(): Promise<Candidate[]> {
  try {
    const candidatesCollection = collection(db, 'candidates');
    const candidatesSnapshot = await getDocs(candidatesCollection);
    
    const candidates: Candidate[] = [];
    candidatesSnapshot.forEach(doc => {
      candidates.push({ id: doc.id, ...doc.data() } as Candidate);
    });
    
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
}

// Get candidates by job
export async function getCandidatesByJob(jobId: string): Promise<Candidate[]> {
  try {
    const candidatesCollection = collection(db, 'candidates');
    const q = query(
      candidatesCollection,
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    
    const candidatesSnapshot = await getDocs(q);
    
    const candidates: Candidate[] = [];
    candidatesSnapshot.forEach(doc => {
      candidates.push({ id: doc.id, ...doc.data() } as Candidate);
    });
    
    return candidates;
  } catch (error) {
    console.error(`Error fetching candidates for job ${jobId}:`, error);
    throw error;
  }
}

// Get a single candidate
export async function getCandidate(candidateId: string): Promise<Candidate | null> {
  try {
    const candidateDoc = await getDoc(doc(db, 'candidates', candidateId));
    
    if (candidateDoc.exists()) {
      return { id: candidateDoc.id, ...candidateDoc.data() } as Candidate;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching candidate ${candidateId}:`, error);
    throw error;
  }
}

// Create a new candidate
export async function createCandidate(candidateData: NewCandidateData): Promise<Candidate> {
  try {
    // Validate that job exists
    const jobRef = doc(db, 'jobs', candidateData.jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error(`Job with ID ${candidateData.jobId} not found`);
    }
    
    const now = Timestamp.now();
    
    const newCandidate = {
      ...candidateData,
      createdAt: now,
      updatedAt: now
    };
    
    const candidateRef = await addDoc(collection(db, 'candidates'), newCandidate);
    
    return {
      id: candidateRef.id,
      ...newCandidate
    } as Candidate;
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
}

// Update a candidate
export async function updateCandidate(candidateId: string, candidateData: Partial<Candidate>): Promise<void> {
  try {
    const updates = {
      ...candidateData,
      updatedAt: Timestamp.now()
    };
    
    // Remove id field if present (can't update document ID)
    if ('id' in updates) {
      delete updates.id;
    }
    
    await updateDoc(doc(db, 'candidates', candidateId), updates);
  } catch (error) {
    console.error(`Error updating candidate ${candidateId}:`, error);
    throw error;
  }
}

// Delete a candidate
export async function deleteCandidate(candidateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'candidates', candidateId));
  } catch (error) {
    console.error(`Error deleting candidate ${candidateId}:`, error);
    throw error;
  }
} 