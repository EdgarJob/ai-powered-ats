import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';

export function SampleDataGeneratorWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Sample Data Generator</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                The sample data generator functionality is being migrated to Firebase.
            </Alert>

            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Data Generator Update</Typography>
                <Typography variant="body1">
                    We're upgrading our sample data generation tools to work with Firebase.
                    This will allow for more realistic test data and improved performance.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    The updated tool will be available soon.
                </Typography>
            </Paper>
        </Box>
    );
} 