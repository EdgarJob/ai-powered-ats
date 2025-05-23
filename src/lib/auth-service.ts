import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Define a user role type similar to your Supabase setup
export type UserRole = 'admin' | 'member';

// Interface for user data stored in Firestore
export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  orgId?: string;
  displayName?: string;
}

// Sign up a new user
export async function signUp(email: string, password: string, displayName: string, role: UserRole = 'member'): Promise<UserData> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user document in Firestore
    const userData: UserData = {
      id: user.uid,
      email: user.email || email,
      role: role,
      displayName: displayName
    };

    await setDoc(doc(db, "users", user.uid), userData);
    return userData;
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string): Promise<UserData | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userData = await getUserData(user.uid);
    return userData;
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
}

// Sign out the current user
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
}

// Get user data from Firestore
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      console.warn(`No user data found for userId: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// Listen to auth state changes (replacement for Supabase session handling)
export function subscribeToAuthChanges(callback: (user: User | null, userData: UserData | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      const userData = await getUserData(user.uid);
      callback(user, userData);
    } else {
      // User is signed out
      callback(null, null);
    }
  });
}

// Check if user has a specific role
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const userData = await getUserData(userId);
  return userData?.role === role;
}

// Current user state
export function getCurrentUser(): User | null {
  return auth.currentUser;
} 