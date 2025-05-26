import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';

export function AIMatchingWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>AI Job Matching</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                The AI matching system is being upgraded to work with our new Firebase database.
            </Alert>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>AI Matching Engine Update</Typography>
                <Typography variant="body1">
                    We're enhancing our AI matching algorithm to provide even better candidate recommendations.
                    The system will analyze candidate skills, experience, and qualifications to match them with
                    the most suitable job openings.
                </Typography>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f7', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary">Coming Soon:</Typography>
                    <ul>
                        <li>Improved candidate-job matching accuracy</li>
                        <li>Real-time matching updates</li>
                        <li>Better filtering options</li>
                        <li>Enhanced scoring system</li>
                    </ul>
                </Box>
            </Paper>
        </Box>
    );
} 