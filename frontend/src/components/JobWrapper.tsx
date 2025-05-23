import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

export function JobWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Job Listings</Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
                The job management functionality is being migrated to Firebase. Please check back soon.
            </Alert>

            <Box sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f9f9f9', textAlign: 'center' }}>
                <Typography variant="h6">
                    We're upgrading our job management system for better performance
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    The job listing and management tools are currently being migrated to a new database system.
                    This migration will provide faster performance, better reliability, and improved features.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Expected completion: Soon
                </Typography>
            </Box>
        </Box>
    );
} 