import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert, Divider, CircularProgress, Container, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TextField } from '@mui/material';
import { supabase, supabaseAdmin } from '../lib/supabase';
import config from '../lib/config';
import { createSampleUsers, SAMPLE_USERS } from '../lib/create-sample-users';

export function SupabaseDiagnostic() {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Record<string, any>>({});
    const [error, setError] = useState<string | null>(null);
    const [databaseResults, setDatabaseResults] = useState<any>(null);
    const [databaseError, setDatabaseError] = useState<string | null>(null);
    const [isCreatingUsers, setIsCreatingUsers] = useState(false);
    const [usersCreationResult, setUsersCreationResult] = useState<{ success: boolean, message: string } | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [testPassword, setTestPassword] = useState('');
    const [testingLogin, setTestingLogin] = useState(false);
    const [loginResult, setLoginResult] = useState<{ success: boolean, message: string, user?: any } | null>(null);

    useEffect(() => {
        const runDiagnostics = async () => {
            setLoading(true);
            const diagnosticResults: Record<string, any> = {
                config: {
                    supabaseUrl: config.supabaseUrl,
                    hasAnonKey: !!config.supabaseAnonKey,
                    hasServiceKey: !!config.supabaseServiceKey,
                    environment: config.environment
                }
            };

            try {
                // Test regular client connection
                try {
                    const { data: tableData, error: tableError } = await supabase
                        .from('_tables')
                        .select('*')
                        .limit(1);

                    diagnosticResults.regularClient = {
                        connected: !tableError,
                        error: tableError ? tableError.message : null,
                        tables: tableData
                    };
                } catch (e) {
                    diagnosticResults.regularClient = {
                        connected: false,
                        error: e instanceof Error ? e.message : String(e)
                    };
                }

                // Test admin client connection
                try {
                    const { data: tableData, error: tableError } = await supabaseAdmin
                        .from('_tables')
                        .select('*')
                        .limit(1);

                    diagnosticResults.adminClient = {
                        connected: !tableError,
                        error: tableError ? tableError.message : null,
                        tables: tableData
                    };
                } catch (e) {
                    diagnosticResults.adminClient = {
                        connected: false,
                        error: e instanceof Error ? e.message : String(e)
                    };
                }

                // Check for jobs table and any jobs
                try {
                    const { data: allJobs, error: jobsError } = await supabaseAdmin
                        .from('jobs')
                        .select('id, title, status')
                        .limit(10);

                    diagnosticResults.jobs = {
                        success: !jobsError,
                        error: jobsError ? jobsError.message : null,
                        count: allJobs?.length || 0,
                        jobs: allJobs
                    };
                } catch (e) {
                    diagnosticResults.jobs = {
                        success: false,
                        error: e instanceof Error ? e.message : String(e)
                    };
                }

                // Check for published jobs specifically
                try {
                    const { data: publishedJobs, error: publishedJobsError } = await supabaseAdmin
                        .from('jobs')
                        .select('id, title')
                        .eq('status', 'published')
                        .limit(10);

                    diagnosticResults.publishedJobs = {
                        success: !publishedJobsError,
                        error: publishedJobsError ? publishedJobsError.message : null,
                        count: publishedJobs?.length || 0,
                        jobs: publishedJobs
                    };
                } catch (e) {
                    diagnosticResults.publishedJobs = {
                        success: false,
                        error: e instanceof Error ? e.message : String(e)
                    };
                }

                setResults(diagnosticResults);
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setLoading(false);
            }
        };

        runDiagnostics();
    }, []);

    const handleRefresh = () => {
        setError(null);
        setResults({});
        setLoading(true);
        window.location.reload();
    };

    // Create sample users
    const handleCreateSampleUsers = async () => {
        try {
            setIsCreatingUsers(true);
            setUsersCreationResult(null);

            const result = await createSampleUsers();
            setUsersCreationResult(result);
        } catch (error) {
            setUsersCreationResult({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error creating sample users'
            });
        } finally {
            setIsCreatingUsers(false);
        }
    };

    // Test login function
    const handleTestLogin = async () => {
        try {
            setTestingLogin(true);
            setLoginResult(null);

            console.log(`Testing login with ${testEmail}...`);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });

            if (error) {
                console.error('Login test failed:', error);
                setLoginResult({
                    success: false,
                    message: `Login failed: ${error.message}`
                });
            } else {
                console.log('Login test succeeded:', data);
                setLoginResult({
                    success: true,
                    message: 'Login successful!',
                    user: data.user
                });
            }
        } catch (error) {
            console.error('Exception during login test:', error);
            setLoginResult({
                success: false,
                message: `Exception: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            setTestingLogin(false);
        }
    };

    const handleQuickLogin = (email: string, password: string) => {
        setTestEmail(email);
        setTestPassword(password);
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" p={4} gap={2}>
                <CircularProgress />
                <Typography>Running Supabase diagnostics...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error running diagnostics: {error}
                </Alert>
                <Button variant="contained" onClick={handleRefresh}>
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>Supabase Diagnostics</Typography>
                <Typography variant="body1" paragraph>
                    Use this page to diagnose connection issues with your Supabase database.
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Configuration</Typography>
                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(results.config, null, 2)}
                    </pre>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Regular Client Connection</Typography>
                    {results.regularClient?.connected ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Regular Supabase client connected successfully
                        </Alert>
                    ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Regular Supabase client connection failed: {results.regularClient?.error}
                        </Alert>
                    )}
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Admin Client Connection</Typography>
                    {results.adminClient?.connected ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Admin Supabase client connected successfully
                        </Alert>
                    ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Admin Supabase client connection failed: {results.adminClient?.error}
                        </Alert>
                    )}
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Jobs Table</Typography>
                    {results.jobs?.success ? (
                        <>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Successfully queried jobs table. Found {results.jobs.count} jobs.
                            </Alert>
                            {results.jobs.count > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle1" gutterBottom>Available Jobs:</Typography>
                                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                        {JSON.stringify(results.jobs.jobs, null, 2)}
                                    </pre>
                                </Box>
                            )}
                        </>
                    ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Failed to query jobs table: {results.jobs?.error}
                        </Alert>
                    )}
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Published Jobs</Typography>
                    {results.publishedJobs?.success ? (
                        <>
                            <Alert severity={results.publishedJobs.count > 0 ? "success" : "warning"} sx={{ mb: 2 }}>
                                Found {results.publishedJobs.count} published jobs.
                            </Alert>
                            {results.publishedJobs.count > 0 ? (
                                <Box mt={2}>
                                    <Typography variant="subtitle1" gutterBottom>Published Jobs:</Typography>
                                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                        {JSON.stringify(results.publishedJobs.jobs, null, 2)}
                                    </pre>
                                </Box>
                            ) : (
                                <Typography>
                                    There are no published jobs. You need to create and publish jobs for them to appear on the Current Job Openings page.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Failed to query published jobs: {results.publishedJobs?.error}
                        </Alert>
                    )}
                </Paper>

                <Button variant="contained" onClick={handleRefresh} sx={{ mr: 2 }}>
                    Refresh Diagnostics
                </Button>

                {/* Sample Users Section */}
                <Box mt={6}>
                    <Typography variant="h5" gutterBottom>Sample Users</Typography>
                    <Typography variant="body1" paragraph>
                        Create sample user accounts for testing. These accounts will have the email and password combinations listed below.
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        All sample users will have the password: <strong>password123</strong>
                    </Alert>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Password</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {SAMPLE_USERS.map((user) => (
                                    <TableRow key={user.email}>
                                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.password}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        variant="contained"
                        onClick={handleCreateSampleUsers}
                        disabled={isCreatingUsers}
                        startIcon={isCreatingUsers ? <CircularProgress size={20} /> : null}
                    >
                        {isCreatingUsers ? 'Creating Users...' : 'Create Sample Users'}
                    </Button>

                    {usersCreationResult && (
                        <Alert
                            severity={usersCreationResult.success ? "success" : "error"}
                            sx={{ mt: 2 }}
                        >
                            {usersCreationResult.message}
                        </Alert>
                    )}
                </Box>

                {/* Login Test Section */}
                <Box mt={6}>
                    <Typography variant="h5" gutterBottom>Login Test</Typography>
                    <Typography variant="body1" paragraph>
                        Test logging in with a user account to verify credentials are working.
                    </Typography>

                    <Box display="flex" gap={2} mb={3}>
                        <TextField
                            label="Email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={testPassword}
                            onChange={(e) => setTestPassword(e.target.value)}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            onClick={handleTestLogin}
                            disabled={testingLogin || !testEmail || !testPassword}
                            sx={{ minWidth: '120px' }}
                        >
                            {testingLogin ? 'Testing...' : 'Test Login'}
                        </Button>
                    </Box>

                    <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
                        >
                            Test Admin
                        </Button>
                        {SAMPLE_USERS.map(user => (
                            <Button
                                key={user.email}
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickLogin(user.email, user.password)}
                            >
                                Test {user.firstName}
                            </Button>
                        ))}
                    </Box>

                    {loginResult && (
                        <Alert
                            severity={loginResult.success ? "success" : "error"}
                            sx={{ mt: 2 }}
                        >
                            {loginResult.message}
                        </Alert>
                    )}

                    {loginResult?.user && (
                        <Box mt={2}>
                            <Typography variant="subtitle1">User Details:</Typography>
                            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                                {JSON.stringify(loginResult.user, null, 2)}
                            </pre>
                        </Box>
                    )}
                </Box>

            </Paper>
        </Container>
    );
} 