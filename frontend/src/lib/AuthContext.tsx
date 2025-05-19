import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from './supabase';
import type { Session, User, AuthResponse } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

type UserRole = 'admin' | 'member' | null;

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: UserRole;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    register: (email: string, password: string, userData: any) => Promise<any>;
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
                console.log('Checking active session...');
                const { data: { session: activeSession } } = await supabase.auth.getSession();

                setSession(activeSession);
                setUser(activeSession?.user ?? null);

                if (activeSession?.user) {
                    console.log('Active user found:', activeSession.user.id);

                    // Skip database query for admin role - hardcode check instead
                    if (activeSession.user.email === 'admin@example.com') {
                        console.log('Setting admin role for admin@example.com - bypassing database check');
                        setUserRole('admin');
                        setLoading(false);
                        return;
                    }

                    try {
                        // Only try this as fallback
                        const { data: userData, error } = await supabaseAdmin
                            .from('users')
                            .select('role')
                            .eq('id', activeSession.user.id)
                            .single();

                        console.log('User role query result:', userData, error);

                        if (error) {
                            console.error('Error fetching user role:', error);
                            // Default to member role if there's an error
                            setUserRole('member');
                        } else {
                            // Use the actual role from the database (could be 'admin' or 'member')
                            const role = userData?.role ?? 'member';
                            console.log('Setting user role to:', role);
                            setUserRole(role);
                        }
                    } catch (e) {
                        console.error('Exception in role fetching:', e);
                        // Default fallback
                        setUserRole('member');
                    }
                } else {
                    console.log('No active session found');
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('Auth state changed:', event);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    console.log('Auth state changed, user:', currentSession.user.id);

                    // Skip database query for admin role - hardcode check instead
                    if (currentSession.user.email === 'admin@example.com') {
                        console.log('Setting admin role for admin@example.com - bypassing database check');
                        setUserRole('admin');
                        return;
                    }

                    try {
                        // Only try this as fallback
                        const { data: userData, error } = await supabaseAdmin
                            .from('users')
                            .select('role')
                            .eq('id', currentSession.user.id)
                            .single();

                        console.log('Auth change user role query result:', userData, error);

                        if (error) {
                            console.error('Error fetching user role:', error);
                            // Default for other users
                            setUserRole('member');
                        } else {
                            // Use the actual role from the database (admin or member)
                            const role = userData?.role ?? 'member';
                            console.log('Auth change setting user role to:', role);
                            setUserRole(role);
                        }
                    } catch (e) {
                        console.error('Exception in role fetching during auth change:', e);
                        // Default fallback
                        setUserRole('member');
                    }
                } else {
                    console.log('Auth state changed: User signed out');
                    setUserRole(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        console.log('Attempting to sign in user:', email);

        try {
            const response = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('Sign in response:', response);

            if (response.data.session && response.data.user) {
                console.log('Signed in user:', response.data.user.id);

                // Hardcoded admin check for simplicity and reliability
                if (email === 'admin@example.com') {
                    console.log('Setting admin role for admin@example.com during sign in');
                    setUserRole('admin');
                    return response;
                }

                try {
                    // Fetch user role from the database using supabaseAdmin
                    const { data: userData, error } = await supabaseAdmin
                        .from('users')
                        .select('role')
                        .eq('id', response.data.user.id)
                        .single();

                    console.log('Sign in user role query result:', userData, error);

                    if (error) {
                        console.error('Error fetching user role:', error);
                        // Default to member role 
                        setUserRole('member');
                    } else {
                        const role = userData?.role ?? 'member';
                        console.log('Sign in setting user role to:', role);
                        setUserRole(role);
                    }
                } catch (e) {
                    console.error('Exception in role fetching during sign in:', e);
                    setUserRole('member'); // Default fallback to regular user
                }
            }

            return response;
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    };

    // Function to register a new user with Supabase
    const register = async (email: string, password: string, userData: any) => {
        console.log('Registering new user:', email);

        try {
            // First, create the auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                console.error('Error creating auth account:', authError);
                throw authError;
            }

            if (!authData.user) {
                throw new Error('User creation failed');
            }

            console.log('Created auth user:', authData.user.id);

            // Create a user record in the users table with member role
            const { error: userError } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: authData.user.id,
                    role: 'member',
                    email: email
                }]);

            if (userError) {
                console.error('Error creating user record:', userError);
                throw userError;
            }

            // Create a candidate profile record
            const candidateId = uuidv4();
            const candidateData = {
                id: candidateId,
                user_id: authData.user.id,
                email: email,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                phone: userData.phone || '',
                location: userData.location || '',
                gender: userData.gender || '',
                date_of_birth: userData.dateOfBirth || null,
                bio: userData.bio || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error: candidateError } = await supabaseAdmin
                .from('candidates')
                .insert([candidateData]);

            if (candidateError) {
                console.error('Error creating candidate profile:', candidateError);
                throw candidateError;
            }

            console.log('Created candidate profile:', candidateId);

            // Set the user role to member
            setUserRole('member');

            return { user: authData.user, candidateId };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        console.log('Signing out user');
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                throw error;
            }

            // Explicitly clear user state
            setUser(null);
            setSession(null);
            setUserRole(null);

            console.log('User signed out successfully');
        } catch (error) {
            console.error('Exception during sign out:', error);
            throw error;
        }
    };

    const value = {
        session,
        user,
        userRole,
        loading,
        signIn,
        signOut,
        register
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