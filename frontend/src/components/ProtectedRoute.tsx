import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute - Auth state:', { user: !!user, isAdmin, loading });
    console.log('ProtectedRoute - adminOnly:', adminOnly);

    // Show loading spinner while checking authentication
    if (loading) {
        console.log('ProtectedRoute - Still loading auth state');
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // If user is not logged in, redirect to login page
    if (!user) {
        console.log('ProtectedRoute - No user found, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If admin access is required but user is not an admin, redirect
    if (adminOnly && !isAdmin) {
        console.log('ProtectedRoute - Admin access required but user is not admin, redirecting');
        return <Navigate to="/" replace />;
    }

    // User is logged in and has required permissions, render the children
    console.log('ProtectedRoute - Access granted');
    return <>{children}</>;
} 