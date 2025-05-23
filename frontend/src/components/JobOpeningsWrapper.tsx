import React from 'react';
import { Box, Typography, Alert, Grid, Card, CardContent } from '@mui/material';

export function JobOpeningsWrapper() {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Job Openings</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                We're upgrading our job listings page for better performance. Please check back soon.
            </Alert>

            <Grid container spacing={3}>
                {[1, 2, 3].map((item) => (
                    <Grid item xs={12} md={4} key={item}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1 }}>Example Job Position</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Our job listings are being migrated to a new database. This will improve search speed and application processing.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 