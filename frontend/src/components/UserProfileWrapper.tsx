import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';

export function UserProfileWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>User Profile</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                The user profile functionality is being migrated to Firebase. Please check back soon.
            </Alert>

            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Profile Management Update In Progress</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    We're improving the profile management system with enhanced security and faster performance.
                </Typography>
            </Paper>
        </Box>
    );
} 