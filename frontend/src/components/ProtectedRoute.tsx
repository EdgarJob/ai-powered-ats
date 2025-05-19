import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'member';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, userRole, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute - Current user role:', userRole);
    console.log('ProtectedRoute - Required role:', requiredRole);

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
        // Use Navigate component instead of window.location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required, check if user has the role
    if (requiredRole && userRole !== requiredRole) {
        console.log('ProtectedRoute - Role mismatch, redirecting');
        // If admin role is required and user doesn't have it, redirect to job openings page
        return <Navigate to="/" replace />;
    }

    // User is logged in and has required role, render the children
    console.log('ProtectedRoute - Access granted');
    return <>{children}</>;
} 