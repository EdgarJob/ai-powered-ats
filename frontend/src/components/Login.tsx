import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    Collapse,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { supabaseAdmin } from '../lib/supabase';

// Define the structure of a real user from the database
interface RealUser {
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    role: string;
    password: string;
}

// Define interface for user data from Supabase
interface UserData {
    id: string;
    role: string;
    candidates: any;
}

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSampleUsers, setShowSampleUsers] = useState(false);
    const [realUsers, setRealUsers] = useState<RealUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse the from parameter if it exists, otherwise redirect to home
    const from = location.state?.from?.pathname || '/';

    // Fetch real users from the database
    useEffect(() => {
        const fetchRealUsers = async () => {
            if (showSampleUsers) {
                setLoadingUsers(true);
                try {
                    // Get users from the auth and public users tables
                    const { data, error } = await supabaseAdmin
                        .from('users')
                        .select(`
                            id, 
                            role,
                            candidates(
                                email, 
                                first_name, 
                                last_name,
                                full_name
                            )
                        `);

                    if (error) {
                        console.error('Error fetching users:', error);
                        setConnectionError(`Database error: ${error.message}. This may indicate a connection issue with Supabase.`);
                        return;
                    }

                    // Transform the data into our RealUser format
                    const userList: RealUser[] = [];

                    // First add the admin user
                    userList.push({
                        email: 'admin@example.com',
                        fullName: 'Administrator',
                        role: 'admin',
                        password: 'admin123'
                    });

                    // Then add the real users from the database
                    if (data && Array.isArray(data)) {
                        data.forEach((user: UserData) => {
                            // Handle the case where candidates is an array or a single object
                            const candidateData = user.candidates ?
                                (Array.isArray(user.candidates) ? user.candidates[0] : user.candidates) : null;

                            if (candidateData && candidateData.email && candidateData.email !== 'admin@example.com') {
                                userList.push({
                                    email: candidateData.email,
                                    firstName: candidateData.first_name,
                                    lastName: candidateData.last_name,
                                    fullName: candidateData.full_name ||
                                        `${candidateData.first_name || ''} ${candidateData.last_name || ''}`.trim(),
                                    role: user.role,
                                    password: 'password123'
                                });
                            }
                        });
                    } else {
                        console.warn('User data is not in expected format:', data);
                        setConnectionError('User data is not in expected format. Please check database connection.');
                    }

                    setRealUsers(userList);
                } catch (err) {
                    console.error('Exception fetching users:', err);
                    setConnectionError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
                } finally {
                    setLoadingUsers(false);
                }
            }
        };

        fetchRealUsers();
    }, [showSampleUsers]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!email) {
                setError('Email is required');
                setLoading(false);
                return;
            }

            if (!password) {
                setError('Password is required');
                setLoading(false);
                return;
            }

            console.log(`Attempting to sign in with ${email} and password ${password}`);
            const { error: signInError, data } = await signIn(email, password);

            if (signInError) {
                console.error('Login error details:', signInError);
                setError(`Login failed: ${signInError.message}. Please check your credentials and ensure the Supabase server is running.`);
            } else {
                console.log('Login successful, data:', data);
                // Redirect to the page they were trying to access
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSelectSampleUser = (user: RealUser) => {
        setEmail(user.email);
        setPassword(user.password);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                        Login
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
                        Sign in to manage your ATS system
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {connectionError && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {connectionError}
                            <Typography variant="body2" mt={1}>
                                Make sure your Supabase server is running and configured correctly.
                            </Typography>
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Box>

                    {/* Sample Users Section */}
                    <Box mt={3}>
                        <Button
                            onClick={() => setShowSampleUsers(!showSampleUsers)}
                            endIcon={showSampleUsers ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            fullWidth
                            variant="outlined"
                            color="secondary"
                        >
                            {showSampleUsers ? 'Hide Sample Users' : 'Show Available Users'}
                        </Button>
                        <Collapse in={showSampleUsers}>
                            <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Available User Accounts
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Click on any user to auto-fill login credentials.
                                </Typography>

                                {loadingUsers ? (
                                    <Box display="flex" justifyContent="center" py={2}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : realUsers.length > 0 ? (
                                    <List dense>
                                        {realUsers.map((user) => (
                                            <ListItem
                                                key={user.email}
                                                button
                                                onClick={() => handleSelectSampleUser(user)}
                                                sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}
                                            >
                                                <ListItemText
                                                    primary={user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                                                    secondary={`${user.email} | Role: ${user.role} | Password: ${user.password}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        No user accounts found. Visit the {' '}
                                        <Link component={RouterLink} to="/diagnostics">Diagnostics</Link> page to create sample users.
                                    </Alert>
                                )}
                            </Paper>
                        </Collapse>
                    </Box>
                </CardContent>
            </Card>

            {/* Admin Login Reminder */}
            <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    For admin access, use <strong>admin@example.com</strong> with password <strong>admin123</strong>
                </Typography>
            </Box>
        </Box>
    );
} 