import React from 'react';
import { Box, Typography, Alert, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function JobApplicationWrapper() {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Job Application</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                The job application system is being upgraded to a new database platform.
            </Alert>

            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Application System Upgrade</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    We're improving the job application system with enhanced features and faster processing.
                    Applications will be available again soon.
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Return to Job Listings
                </Button>
            </Paper>
        </Box>
    );
} 