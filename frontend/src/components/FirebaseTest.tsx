import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useAuth } from '../lib/AuthContext';
import { checkFirebaseConnection } from '../lib/firebase';

export default function FirebaseTest() {
    const { user, signIn, signUp, logout } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Test Firebase connection
    useEffect(() => {
        async function testConnection() {
            try {
                const result = await checkFirebaseConnection();
                setConnectionStatus(result.success ? 'success' : 'error');
                if (!result.success) {
                    setErrorMessage(result.error || 'Unknown error');
                }
            } catch (error) {
                setConnectionStatus('error');
                setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
            }
        }
        testConnection();
    }, []);

    // Test authentication
    const handleTestSignIn = async () => {
        try {
            await signIn('test@example.com', 'password123');
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    const handleTestSignUp = async () => {
        try {
            await signUp('test@example.com', 'password123');
        } catch (error) {
            console.error('Sign up error:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Firebase Connection Test
            </Typography>

            {/* Connection Status */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Connection Status:
                </Typography>
                {connectionStatus === 'checking' && (
                    <Alert severity="info">Checking Firebase connection...</Alert>
                )}
                {connectionStatus === 'success' && (
                    <Alert severity="success">Firebase connection successful!</Alert>
                )}
                {connectionStatus === 'error' && (
                    <Alert severity="error">
                        Firebase connection failed: {errorMessage}
                    </Alert>
                )}
            </Box>

            {/* Authentication Test */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Authentication Test:
                </Typography>
                {user ? (
                    <Box>
                        <Typography>Logged in as: {user.email}</Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={logout}
                            sx={{ mt: 1 }}
                        >
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTestSignIn}
                            sx={{ mr: 1 }}
                        >
                            Test Sign In
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleTestSignUp}
                        >
                            Test Sign Up
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Environment Variables Check */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Environment Variables:
                </Typography>
                <Typography>
                    API Key Present: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Yes' : 'No'}
                </Typography>
                <Typography>
                    Project ID Present: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Yes' : 'No'}
                </Typography>
            </Box>
        </Box>
    );
} 