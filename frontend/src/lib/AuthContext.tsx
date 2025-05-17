import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { Session, User, AuthResponse } from '@supabase/supabase-js';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: UserRole;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for active session on component mount
        const checkSession = async () => {
            try {
                const { data: { session: activeSession } } = await supabase.auth.getSession();
                setSession(activeSession);
                setUser(activeSession?.user ?? null);

                if (activeSession?.user) {
                    // Fetch user role from the database
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', activeSession.user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user role:', error);
                        setUserRole(null);
                    } else {
                        setUserRole(userData?.role ?? 'user');
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    // Fetch user role from the database
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', currentSession.user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user role:', error);
                        setUserRole(null);
                    } else {
                        setUserRole(userData?.role ?? 'user');
                    }
                } else {
                    setUserRole(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const response = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (response.data.session && response.data.user) {
            // Fetch user role from the database
            const { data: userData, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', response.data.user.id)
                .single();

            if (error) {
                console.error('Error fetching user role:', error);
                setUserRole(null);
            } else {
                setUserRole(userData?.role ?? 'user');
            }
        }

        return response;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUserRole(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        session,
        user,
        userRole,
        loading,
        signIn,
        signOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 