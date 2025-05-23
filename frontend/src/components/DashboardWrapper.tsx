import React from 'react';
import { Box, Typography, Alert, Grid, Paper } from '@mui/material';

export function DashboardWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                The dashboard functionality is being migrated to Firebase for better performance.
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>System Status</Typography>
                        <Typography variant="body1">
                            Dashboard is currently being upgraded to use Firebase Firestore for real-time updates and improved performance.
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Data Migration</Typography>
                        <Typography variant="body1">
                            User data, job listings, and candidate information are being migrated to the new database system.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
} 