import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserData, UserData, isUserAdmin } from '../lib/auth-service';

interface AuthContextType {
    currentUser: User | null;
    userData: UserData | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user?.email || 'No user');
            setCurrentUser(user);

            if (user) {
                try {
                    // Get user data from Firestore
                    const data = await getUserData(user.uid);
                    setUserData(data);

                    // Check if user is admin
                    const adminStatus = await isUserAdmin(user);
                    setIsAdmin(adminStatus);

                    console.log('User data loaded:', { email: user.email, role: data?.role, isAdmin: adminStatus });
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setUserData(null);
                    setIsAdmin(false);
                }
            } else {
                setUserData(null);
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signOut = async () => {
        try {
            const { signOut: firebaseSignOut } = await import('../lib/auth-service');
            await firebaseSignOut();
            setCurrentUser(null);
            setUserData(null);
            setIsAdmin(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        currentUser,
        userData,
        isAdmin,
        loading,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 