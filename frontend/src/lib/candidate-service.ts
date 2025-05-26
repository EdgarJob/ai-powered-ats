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
  Timestamp,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentPosition?: string;
  yearsOfExperience?: number;
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  skills: string[];
  resumeUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface JobApplication {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'applied' | 'review' | 'interview' | 'offer' | 'rejected' | 'accepted';
  matchScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new candidate profile
export async function createCandidate(
  candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>,
  resumeFile?: File
): Promise<Candidate> {
  try {
    let resumeUrl;
    
    // Upload resume if provided
    if (resumeFile && candidateData.userId) {
      const fileExt = resumeFile.name.split('.').pop();
      const filename = `${Date.now()}.${fileExt}`;
      const storagePath = `resumes/${candidateData.userId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, resumeFile);
      resumeUrl = await getDownloadURL(storageRef);
    }
    
    const newCandidate = {
      ...candidateData,
      resumeUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'candidates'), newCandidate);
    
    return {
      id: docRef.id,
      ...newCandidate
    };
  } catch (error) {
    console.error('Error creating candidate:', error);
    throw error;
  }
}

// Get a candidate by ID
export async function getCandidate(candidateId: string): Promise<Candidate | null> {
  try {
    const docRef = doc(db, 'candidates', candidateId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Candidate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting candidate:', error);
    throw error;
  }
}

// Get all candidates with optional filtering
export async function getCandidates(options: {
  userId?: string;
  limit?: number;
} = {}): Promise<Candidate[]> {
  try {
    const candidatesQuery = collection(db, 'candidates');
    const constraints = [];
    
    if (options.userId) {
      constraints.push(where('userId', '==', options.userId));
    }
    
    // Always sort by creation date, descending
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    const q = query(candidatesQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const candidates: Candidate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      candidates.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Candidate);
    });
    
    return candidates;
  } catch (error) {
    console.error('Error getting candidates:', error);
    throw error;
  }
}

// Update a candidate profile
export async function updateCandidate(
  candidateId: string, 
  candidateData: Partial<Omit<Candidate, 'id' | 'createdAt' | 'userId'>>,
  resumeFile?: File
): Promise<Candidate> {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    
    // Get current candidate to get userId
    const currentCandidate = await getCandidate(candidateId);
    if (!currentCandidate) {
      throw new Error(`Candidate with ID ${candidateId} not found`);
    }
    
    let resumeUrl = candidateData.resumeUrl;
    
    // Upload new resume if provided
    if (resumeFile && currentCandidate.userId) {
      // Delete old resume if exists
      if (currentCandidate.resumeUrl) {
        try {
          const oldResumeRef = ref(storage, currentCandidate.resumeUrl);
          await deleteObject(oldResumeRef);
        } catch (error) {
          console.warn('Could not delete old resume, it may not exist:', error);
        }
      }
      
      const fileExt = resumeFile.name.split('.').pop();
      const filename = `${Date.now()}.${fileExt}`;
      const storagePath = `resumes/${currentCandidate.userId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, resumeFile);
      resumeUrl = await getDownloadURL(storageRef);
    }
    
    const updateData = {
      ...candidateData,
      resumeUrl,
      updatedAt: new Date()
    };
    
    await updateDoc(candidateRef, updateData);
    
    // Get the updated candidate
    const updatedCandidate = await getCandidate(candidateId);
    if (!updatedCandidate) {
      throw new Error(`Candidate with ID ${candidateId} not found after update`);
    }
    
    return updatedCandidate;
  } catch (error) {
    console.error('Error updating candidate:', error);
    throw error;
  }
}

// Create a job application
export async function createJobApplication(
  candidateId: string, 
  jobId: string, 
  applicationData: Partial<Omit<JobApplication, 'id' | 'candidateId' | 'jobId' | 'createdAt' | 'updatedAt'>> = {}
): Promise<JobApplication> {
  try {
    const newApplication = {
      candidateId,
      jobId,
      status: applicationData.status || 'applied',
      matchScore: applicationData.matchScore,
      notes: applicationData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'applications'), newApplication);
    
    return {
      id: docRef.id,
      ...newApplication
    } as JobApplication;
  } catch (error) {
    console.error('Error creating job application:', error);
    throw error;
  }
}

// Get job applications for a candidate
export async function getJobApplicationsForCandidate(candidateId: string): Promise<JobApplication[]> {
  try {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('candidateId', '==', candidateId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    
    const applications: JobApplication[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as JobApplication);
    });
    
    return applications;
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw error;
  }
}

// Get candidates for a specific job
export async function getCandidatesForJob(jobId: string): Promise<{candidate: Candidate, application: JobApplication}[]> {
  try {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    
    const results: {candidate: Candidate, application: JobApplication}[] = [];
    
    for (const appDoc of querySnapshot.docs) {
      const appData = appDoc.data();
      const application = {
        id: appDoc.id,
        ...appData,
        createdAt: appData.createdAt instanceof Timestamp ? appData.createdAt.toDate() : appData.createdAt,
        updatedAt: appData.updatedAt instanceof Timestamp ? appData.updatedAt.toDate() : appData.updatedAt
      } as JobApplication;
      
      // Get the candidate data
      const candidate = await getCandidate(application.candidateId);
      if (candidate) {
        results.push({ candidate, application });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error getting candidates for job:', error);
    throw error;
  }
} 