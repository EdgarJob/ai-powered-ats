import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    testDatabaseConnection,
    checkExistingData,
    seedDatabase
} from '../scripts/seedDatabase';

export function DatabaseTester() {
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
    const [dataStatus, setDataStatus] = useState<{ candidates: number; jobs: number } | null>(null);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleTestConnection = async () => {
        setLoading(true);
        setError('');
        setMessage('Testing database connection...');

        try {
            const isConnected = await testDatabaseConnection();
            setConnectionStatus(isConnected ? 'connected' : 'failed');

            if (isConnected) {
                setMessage('✅ Database connection successful!');
                // Also check existing data
                const data = await checkExistingData();
                setDataStatus(data);
            } else {
                setError('❌ Database connection failed. Please check your Firebase configuration.');
            }
        } catch (error) {
            setConnectionStatus('failed');
            setError(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckData = async () => {
        setLoading(true);
        setError('');
        setMessage('Checking existing data...');

        try {
            const data = await checkExistingData();
            setDataStatus(data);
            setMessage(`📊 Found ${data.candidates} candidates and ${data.jobs} jobs in database`);
        } catch (error) {
            setError(`❌ Failed to check data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDatabase = async (force: boolean = false) => {
        setLoading(true);
        setError('');
        setMessage('Seeding database with sample data...');

        try {
            await seedDatabase(force);
            setMessage('🎉 Database seeded successfully!');

            // Refresh data status
            const data = await checkExistingData();
            setDataStatus(data);
        } catch (error) {
            setError(`❌ Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    🔧 Database Testing & Setup
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Use this tool to test your database connection and populate it with sample data.
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Connection Status */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Connection Status
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestConnection}
                            disabled={loading}
                        >
                            Test Connection
                        </Button>
                        {connectionStatus === 'connected' && (
                            <Alert severity="success" sx={{ flex: 1 }}>
                                Database Connected
                            </Alert>
                        )}
                        {connectionStatus === 'failed' && (
                            <Alert severity="error" sx={{ flex: 1 }}>
                                Connection Failed
                            </Alert>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Data Status */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Data
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCheckData}
                            disabled={loading}
                        >
                            Check Data
                        </Button>
                        {dataStatus && (
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2">
                                    📊 Candidates: {dataStatus.candidates} | Jobs: {dataStatus.jobs}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Seeding Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Sample Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Populate your database with realistic sample candidates, jobs, and applications.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={() => handleSeedDatabase(false)}
                            disabled={loading}
                        >
                            Seed Database
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleSeedDatabase(true)}
                            disabled={loading}
                            color="warning"
                        >
                            Force Seed (Add More)
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        "Seed Database" will only add data if the database is empty.
                        "Force Seed" will add data regardless.
                    </Typography>
                </Box>

                {/* Loading Indicator */}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Processing...</Typography>
                    </Box>
                )}

                {/* Messages */}
                {message && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                {/* Errors */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Instructions */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Instructions
                    </Typography>
                    <Typography variant="body2" component="div">
                        <ol>
                            <li><strong>Test Connection:</strong> Verify that your app can connect to Firebase</li>
                            <li><strong>Check Data:</strong> See how much data is currently in your database</li>
                            <li><strong>Seed Database:</strong> Add sample candidates, jobs, and applications</li>
                        </ol>
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>Sample Data Includes:</strong><br />
                        • 6 realistic candidate profiles with skills and experience<br />
                        • 5 job postings across different roles and companies<br />
                        • Random job applications with various statuses<br />
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
} 