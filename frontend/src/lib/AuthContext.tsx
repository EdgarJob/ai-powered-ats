import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Define user data interface
interface UserData {
    id: string;
    email: string;
    role: 'admin' | 'member';
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define the shape of our auth context
interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    userRole: 'admin' | 'member' | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch user data from Firestore
    const fetchUserData = async (user: User) => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as UserData;
                setUserData(data);
                setUserRole(data.role);
                console.log('User role loaded:', data.role);
            } else {
                console.log('No user document found in Firestore');
                setUserData(null);
                setUserRole('member'); // Default to member if no document
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserData(null);
            setUserRole('member'); // Default to member on error
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // User is signed in, fetch their role from Firestore
                await fetchUserData(user);
            } else {
                // User is signed out, clear data
                setUserData(null);
                setUserRole(null);
            }

            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Sign in function
    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    };

    // Sign up function
    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        userData,
        userRole,
        loading,
        signIn,
        signUp,
        signOut: logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 