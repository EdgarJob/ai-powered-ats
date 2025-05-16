import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper, Card, CardContent, Divider, List, ListItem, ListItemText } from '@mui/material';
import { supabaseAdmin, refreshSchemaCache } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { fixDatabase, migrateAllResponsibilities } from '../lib/database-fix';
import { createRequiredStorageBuckets } from '../lib/create-storage-buckets';

export function JobDebugPanel() {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const clearResults = () => {
        setResults([]);
        setSuccess(null);
        setError(null);
    };

    const log = (message: string) => {
        setResults(prev => [...prev, message]);
    };

    const handleFixJobs = async () => {
        setLoading(true);
        clearResults();
        try {
            log('Starting job responsibilities fix...');

            // Run the migration function
            const result = await migrateAllResponsibilities();

            if (result.success) {
                log(`Successfully migrated ${result.migrated} out of ${result.total} jobs`);
                setSuccess(`Fixed ${result.migrated} jobs with missing responsibility displays`);
            } else {
                log(`Migration failed: ${result.error}`);
                setError(`Failed to fix jobs: ${result.error}`);
            }

            // Force a refresh of the jobs cache
            await supabaseAdmin.auth.refreshSession();

            log('Job responsibilities fix completed');
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Unknown error';
            log(`Error fixing jobs: ${errorMsg}`);
            setError(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" mb={3}>Job Debug Panel</Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" mb={1}>Fix Job Responsibilities Display</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        This tool will migrate all job responsibilities data to the dedicated column
                        to ensure consistent display on job cards.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFixJobs}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Fix Job Displays'}
                    </Button>
                </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2}>Debug Log:</Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                {results.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No logs yet. Run a tool to see results.</Typography>
                ) : (
                    <List dense disablePadding>
                        {results.map((message, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                                <Typography variant="body2" fontFamily="monospace">
                                    {message}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}

export function StorageDebugPanel() {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const checkBuckets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabaseAdmin.storage.listBuckets();

            if (error) {
                setMessage(`Error checking buckets: ${error.message}`);
            } else {
                setBuckets(data || []);
                setMessage(`Found ${data?.length || 0} buckets`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const createBuckets = async () => {
        setLoading(true);
        try {
            const result = await createRequiredStorageBuckets();
            setMessage(result ? 'Storage buckets created successfully' : 'Failed to create storage buckets');
            // Refresh the bucket list
            checkBuckets();
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Storage Buckets Debug</Typography>

            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={checkBuckets}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    Check Buckets
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={createBuckets}
                    disabled={loading}
                >
                    Create Required Buckets
                </Button>
            </Box>

            {message && (
                <Alert severity={message.includes('Error') ? 'error' : 'info'} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {buckets.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Available Buckets</Typography>
                    <List>
                        {buckets.map((bucket) => (
                            <ListItem key={bucket.id}>
                                <ListItemText
                                    primary={bucket.name}
                                    secondary={`Public: ${bucket.public ? 'Yes' : 'No'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
}

export function DatabaseDebugPanel() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const refreshSchema = async () => {
        setLoading(true);
        try {
            await refreshSchemaCache();
            setMessage('Schema cache refreshed successfully');
        } catch (error) {
            setMessage(`Error refreshing schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const fixDatabaseSchema = async () => {
        setLoading(true);
        try {
            const result = await fixDatabase();
            setMessage(result ? 'Database fixed successfully' : 'Failed to fix database');
        } catch (error) {
            setMessage(`Error fixing database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Database Schema Management</Typography>

            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={refreshSchema}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    Refresh Schema Cache
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={fixDatabaseSchema}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    Fix Database Schema
                </Button>
            </Box>

            {message && (
                <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}
        </Box>
    );
}

export default function DebugPanel() {
    const [activeTab, setActiveTab] = useState('schema');

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" mb={3}>System Debug Panel</Typography>

            <Box sx={{ mb: 3 }}>
                <Button
                    variant={activeTab === 'schema' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('schema')}
                    sx={{ mr: 2 }}
                >
                    Database Schema
                </Button>
                <Button
                    variant={activeTab === 'jobs' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('jobs')}
                    sx={{ mr: 2 }}
                >
                    Jobs Data
                </Button>
                <Button
                    variant={activeTab === 'storage' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('storage')}
                >
                    Storage Buckets
                </Button>
            </Box>

            {activeTab === 'schema' && <DatabaseDebugPanel />}
            {activeTab === 'jobs' && <JobDebugPanel />}
            {activeTab === 'storage' && <StorageDebugPanel />}
        </Box>
    );
} 