import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, signIn, signUp, logOut, UserData } from './auth-service';

// Define the auth context type
interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    error: Error | null;
    login: (email: string, password: string) => Promise<UserData | null>;
    register: (email: string, password: string, displayName: string, role?: 'admin' | 'member') => Promise<UserData>;
    logout: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    error: null,
    login: async () => null,
    register: async () => ({ id: '', email: '', role: 'member' }) as UserData,
    logout: async () => { }
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Initialize auth state
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user, userData) => {
            setUser(user);
            setUserData(userData);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await signIn(email, password);
            return userData;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error during login'));
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (email: string, password: string, displayName: string, role: 'admin' | 'member' = 'member') => {
        try {
            setLoading(true);
            setError(null);
            const userData = await signUp(email, password, displayName, role);
            return userData;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error during registration'));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await logOut();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error during logout'));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Provide the auth context
    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                error,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    return useContext(AuthContext);
} 