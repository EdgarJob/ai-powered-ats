import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

export function LoginWrapper() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // On successful login, the AuthContext should update
            // and the useEffect above will redirect
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            maxWidth: 500,
            mx: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4
        }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Login to ATS System
            </Typography>

            <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
                We've migrated to Firebase authentication. Use an admin account (admin@example.com / admin123) for testing.
            </Alert>

            <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
} 