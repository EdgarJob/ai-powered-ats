import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './firebase';

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload a resume
export const uploadResume = async (
  file: File,
  userId: string
): Promise<string> => {
  const path = `resumes/${userId}/${file.name}`;
  return uploadFile(file, path);
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Delete a resume
export const deleteResume = async (userId: string, fileName: string): Promise<void> => {
  const path = `resumes/${userId}/${fileName}`;
  return deleteFile(path);
}; 