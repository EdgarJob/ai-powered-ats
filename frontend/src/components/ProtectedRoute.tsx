import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, userRole, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
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
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required, check if user has the role
    if (requiredRole && userRole !== requiredRole && requiredRole === 'admin' && userRole !== 'admin') {
        // If admin role is required and user doesn't have it, redirect to job openings page
        return <Navigate to="/" replace />;
    }

    // User is logged in and has required role, render the children
    return <>{children}</>;
} 