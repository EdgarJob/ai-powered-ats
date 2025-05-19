import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { createSampleCandidates } from '../lib/create-sample-candidates';

export function SampleDataGenerator() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCandidates = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const result = await createSampleCandidates();
            setResult(result);
        } catch (err) {
            console.error('Error generating candidates:', err);
            setError(`Failed to generate candidates: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Generate Sample Candidates
                </Typography>
                <Typography color="textSecondary" paragraph>
                    Create 10 diverse sample candidates (5 technical and 5 non-technical) with pre-filled profiles.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        This will create the following sample candidates:
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                        <Chip
                            label="David Chen (Software Developer)"
                            variant="outlined"
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label="Sophia Patel (Data Scientist)"
                            variant="outlined"
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label="Miguel Rodriguez (Cybersecurity)"
                            variant="outlined"
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label="Alex Johnson (DevOps)"
                            variant="outlined"
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label="Grace Kim (Mobile Developer)"
                            variant="outlined"
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label="James Wilson (Marketing)"
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                        <Chip
                            label="Emily Brown (HR)"
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                        <Chip
                            label="Robert Taylor (Finance)"
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                        <Chip
                            label="Olivia Martinez (PR)"
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                        <Chip
                            label="Daniel Jackson (Sales)"
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                    </Stack>

                    <Typography variant="body2" color="textSecondary">
                        All accounts will use the password: <strong>password123</strong>
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateCandidates}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                    {loading ? 'Generating Candidates...' : 'Generate Sample Candidates'}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {result && (
                    <Alert severity={result.success ? 'success' : 'warning'} sx={{ mt: 2 }}>
                        {result.message}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
} 