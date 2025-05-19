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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Divider,
    Chip,
    Stack
} from '@mui/material';
import { Visibility, VisibilityOff, KeyboardArrowDown, KeyboardArrowUp, AccountCircle } from '@mui/icons-material';
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
    isTechnical?: boolean;
    occupation?: string;
}

// Define interface for user data from Supabase
interface UserData {
    id: string;
    role: string;
    email: string;
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
    const [selectedUser, setSelectedUser] = useState<string>('');

    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse the from parameter if it exists, otherwise redirect to home
    const from = location.state?.from?.pathname || '/';

    // Fetch real users from the database
    useEffect(() => {
        const fetchRealUsers = async () => {
            setLoadingUsers(true);
            try {
                // Create a list of sample users without relying on DB relationships
                const userList: RealUser[] = [];

                // First add the admin user
                userList.push({
                    email: 'admin@example.com',
                    fullName: 'Administrator',
                    role: 'admin',
                    password: 'admin123',
                    occupation: 'System Administrator'
                });

                // Add our sample candidates with hardcoded data
                // Technical candidates
                userList.push({
                    email: 'david.chen@example.com',
                    firstName: 'David',
                    lastName: 'Chen',
                    fullName: 'David Chen',
                    role: 'member',
                    password: 'password123',
                    isTechnical: true,
                    occupation: 'Software Developer'
                });

                userList.push({
                    email: 'sophia.patel@example.com',
                    firstName: 'Sophia',
                    lastName: 'Patel',
                    fullName: 'Sophia Patel',
                    role: 'member',
                    password: 'password123',
                    isTechnical: true,
                    occupation: 'Data Scientist'
                });

                userList.push({
                    email: 'miguel.rodriguez@example.com',
                    firstName: 'Miguel',
                    lastName: 'Rodriguez',
                    fullName: 'Miguel Rodriguez',
                    role: 'member',
                    password: 'password123',
                    isTechnical: true,
                    occupation: 'Cybersecurity Analyst'
                });

                userList.push({
                    email: 'alex.johnson@example.com',
                    firstName: 'Alex',
                    lastName: 'Johnson',
                    fullName: 'Alex Johnson',
                    role: 'member',
                    password: 'password123',
                    isTechnical: true,
                    occupation: 'DevOps Engineer'
                });

                userList.push({
                    email: 'grace.kim@example.com',
                    firstName: 'Grace',
                    lastName: 'Kim',
                    fullName: 'Grace Kim',
                    role: 'member',
                    password: 'password123',
                    isTechnical: true,
                    occupation: 'Mobile Developer'
                });

                // Non-technical candidates
                userList.push({
                    email: 'james.wilson@example.com',
                    firstName: 'James',
                    lastName: 'Wilson',
                    fullName: 'James Wilson',
                    role: 'member',
                    password: 'password123',
                    isTechnical: false,
                    occupation: 'Marketing Director'
                });

                userList.push({
                    email: 'emily.brown@example.com',
                    firstName: 'Emily',
                    lastName: 'Brown',
                    fullName: 'Emily Brown',
                    role: 'member',
                    password: 'password123',
                    isTechnical: false,
                    occupation: 'HR Professional'
                });

                userList.push({
                    email: 'robert.taylor@example.com',
                    firstName: 'Robert',
                    lastName: 'Taylor',
                    fullName: 'Robert Taylor',
                    role: 'member',
                    password: 'password123',
                    isTechnical: false,
                    occupation: 'Financial Analyst'
                });

                userList.push({
                    email: 'olivia.martinez@example.com',
                    firstName: 'Olivia',
                    lastName: 'Martinez',
                    fullName: 'Olivia Martinez',
                    role: 'member',
                    password: 'password123',
                    isTechnical: false,
                    occupation: 'PR Specialist'
                });

                userList.push({
                    email: 'daniel.jackson@example.com',
                    firstName: 'Daniel',
                    lastName: 'Jackson',
                    fullName: 'Daniel Jackson',
                    role: 'member',
                    password: 'password123',
                    isTechnical: false,
                    occupation: 'Sales Manager'
                });

                setRealUsers(userList);
                setConnectionError(null);
            } catch (err) {
                console.error('Exception fetching users:', err);
                setConnectionError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchRealUsers();
    }, []);

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

    const handleSelectUser = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        console.log('Selected user email:', value);
        setSelectedUser(value);

        // Find the user with the selected email
        const user = realUsers.find(u => u.email === value);
        console.log('Found user:', user);
        if (user) {
            setEmail(user.email);
            setPassword(user.password);
        }
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

                    {/* Simplified Test Account Selector */}
                    {realUsers.length > 0 && (
                        <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                            <InputLabel id="test-account-label">Login as Test Account</InputLabel>
                            <Select
                                labelId="test-account-label"
                                id="test-account-select"
                                value={selectedUser}
                                label="Login as Test Account"
                                onChange={handleSelectUser}
                            >
                                <MenuItem value="">
                                    <em>Select a test account</em>
                                </MenuItem>

                                {/* Admin Users */}
                                <MenuItem value="admin@example.com">Administrator - Admin</MenuItem>

                                {/* Technical Users */}
                                <MenuItem value="david.chen@example.com">David Chen - Software Developer</MenuItem>
                                <MenuItem value="sophia.patel@example.com">Sophia Patel - Data Scientist</MenuItem>
                                <MenuItem value="miguel.rodriguez@example.com">Miguel Rodriguez - Cybersecurity Analyst</MenuItem>
                                <MenuItem value="alex.johnson@example.com">Alex Johnson - DevOps Engineer</MenuItem>
                                <MenuItem value="grace.kim@example.com">Grace Kim - Mobile Developer</MenuItem>

                                {/* Non-Technical Users */}
                                <MenuItem value="james.wilson@example.com">James Wilson - Marketing Director</MenuItem>
                                <MenuItem value="emily.brown@example.com">Emily Brown - HR Professional</MenuItem>
                                <MenuItem value="robert.taylor@example.com">Robert Taylor - Financial Analyst</MenuItem>
                                <MenuItem value="olivia.martinez@example.com">Olivia Martinez - PR Specialist</MenuItem>
                                <MenuItem value="daniel.jackson@example.com">Daniel Jackson - Sales Manager</MenuItem>
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Select a test account to automatically fill login credentials
                            </Typography>
                        </FormControl>
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

                    {loadingUsers && (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                Loading available user accounts...
                            </Typography>
                        </Box>
                    )}

                    {/* Register New User Link */}
                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register">
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Admin Login Reminder */}
            <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    For admin access, use <strong>admin@example.com</strong> with password <strong>admin123</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                    For all sample candidate accounts, use password: <strong>password123</strong>
                </Typography>
            </Box>
        </Box>
    );
} 