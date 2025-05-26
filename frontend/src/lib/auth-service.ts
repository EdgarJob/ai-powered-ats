import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'admin' | 'member';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Register a new user
export async function registerUser(
  email: string, 
  password: string, 
  userData: Partial<UserData>
): Promise<UserData> {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set display name if provided
    if (userData.firstName || userData.lastName) {
      const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      await updateProfile(user, { displayName });
    }
    
    // Create user document in Firestore
    const newUser: UserData = {
      id: user.uid,
      email: user.email || email,
      role: userData.role || 'member',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), newUser);
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out a user
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get user data from Firestore
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

// Check if user is admin
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    const userData = await getUserData(user.uid);
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 