import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    Stack
} from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PlaceIcon from '@mui/icons-material/Place';

// Define types for our statistics
interface DashboardStats {
    totalCandidates: number;
    totalJobs: number;
    totalApplications: number;
    recentCandidates: number;
    popularEducationLevels: { level: string; count: number }[];
    popularLocations: { location: string; count: number }[];
    jobsByStatus: { status: string; count: number }[];
}

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalCandidates: 0,
        totalJobs: 0,
        totalApplications: 0,
        recentCandidates: 0,
        popularEducationLevels: [],
        popularLocations: [],
        jobsByStatus: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch total candidates
                const { count: candidatesCount, error: candidatesError } = await supabaseAdmin
                    .from('candidates')
                    .select('*', { count: 'exact', head: true });

                if (candidatesError) throw candidatesError;

                // Fetch total jobs
                const { count: jobsCount, error: jobsError } = await supabaseAdmin
                    .from('jobs')
                    .select('*', { count: 'exact', head: true });

                if (jobsError) throw jobsError;

                // Fetch candidates registered in the last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { count: recentCandidatesCount, error: recentCandidatesError } = await supabaseAdmin
                    .from('candidates')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', thirtyDaysAgo.toISOString());

                if (recentCandidatesError) throw recentCandidatesError;

                // Fetch popular education levels
                const { data: educationData, error: educationError } = await supabaseAdmin
                    .from('candidates')
                    .select('education_level')
                    .not('education_level', 'is', null);

                if (educationError) throw educationError;

                // Count education levels
                const educationCounts: Record<string, number> = {};
                educationData?.forEach(candidate => {
                    if (candidate.education_level) {
                        educationCounts[candidate.education_level] = (educationCounts[candidate.education_level] || 0) + 1;
                    }
                });

                const popularEducationLevels = Object.entries(educationCounts)
                    .map(([level, count]) => ({ level, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Fetch popular locations
                const { data: locationData, error: locationError } = await supabaseAdmin
                    .from('candidates')
                    .select('location')
                    .not('location', 'is', null);

                if (locationError) throw locationError;

                // Count locations
                const locationCounts: Record<string, number> = {};
                locationData?.forEach(candidate => {
                    if (candidate.location) {
                        locationCounts[candidate.location] = (locationCounts[candidate.location] || 0) + 1;
                    }
                });

                const popularLocations = Object.entries(locationCounts)
                    .map(([location, count]) => ({ location, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // Fetch jobs by status
                const { data: jobStatusData, error: jobStatusError } = await supabaseAdmin
                    .from('jobs')
                    .select('status');

                if (jobStatusError) throw jobStatusError;

                // Count job statuses
                const jobStatusCounts: Record<string, number> = {};
                jobStatusData?.forEach(job => {
                    const status = job.status || 'unknown';
                    jobStatusCounts[status] = (jobStatusCounts[status] || 0) + 1;
                });

                const jobsByStatus = Object.entries(jobStatusCounts)
                    .map(([status, count]) => ({ status, count }));

                // TODO: Fetch applications count when an applications table is available
                const totalApplications = 0;

                // Update stats state
                setStats({
                    totalCandidates: candidatesCount || 0,
                    totalJobs: jobsCount || 0,
                    totalApplications,
                    recentCandidates: recentCandidatesCount || 0,
                    popularEducationLevels,
                    popularLocations,
                    jobsByStatus
                });

            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    // Helper function to get status color
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'published':
                return '#4caf50'; // green
            case 'draft':
                return '#ff9800'; // orange
            case 'archived':
                return '#9e9e9e'; // grey
            case 'closed':
                return '#f44336'; // red
            default:
                return '#2196f3'; // blue
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Dashboard
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: '#E3F2FD',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PeopleAltIcon sx={{ mr: 1, color: '#1976d2' }} />
                            <Typography variant="subtitle1" color="text.secondary">
                                Candidates
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {stats.totalCandidates}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            +{stats.recentCandidates} in the last 30 days
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: '#F1F8E9',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <WorkIcon sx={{ mr: 1, color: '#7cb342' }} />
                            <Typography variant="subtitle1" color="text.secondary">
                                Active Jobs
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {stats.totalJobs}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total open positions
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: '#FFF3E0',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SchoolIcon sx={{ mr: 1, color: '#ff9800' }} />
                            <Typography variant="subtitle1" color="text.secondary">
                                Education Levels
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {stats.popularEducationLevels.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Unique qualifications
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: '#E8EAF6',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PlaceIcon sx={{ mr: 1, color: '#3f51b5' }} />
                            <Typography variant="subtitle1" color="text.secondary">
                                Locations
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {stats.popularLocations.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Different candidate locations
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Detailed Stats */}
            <Grid container spacing={3}>
                {/* Education Levels */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            height: '100%',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Popular Education Levels
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {stats.popularEducationLevels.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No education data available yet
                            </Typography>
                        ) : (
                            stats.popularEducationLevels.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1.5
                                    }}
                                >
                                    <Typography variant="body1">
                                        {item.level}
                                    </Typography>
                                    <Chip
                                        label={item.count}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#E3F2FD',
                                            color: '#1976d2',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>

                {/* Locations */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            height: '100%',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Candidate Locations
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {stats.popularLocations.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No location data available yet
                            </Typography>
                        ) : (
                            stats.popularLocations.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1.5
                                    }}
                                >
                                    <Typography variant="body1">
                                        {item.location}
                                    </Typography>
                                    <Chip
                                        label={item.count}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#E8EAF6',
                                            color: '#3f51b5',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>

                {/* Jobs by Status */}
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Jobs by Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {stats.jobsByStatus.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No jobs data available yet
                            </Typography>
                        ) : (
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                {stats.jobsByStatus.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={`${item.status}: ${item.count}`}
                                        sx={{
                                            bgcolor: getStatusColor(item.status) + '22',
                                            color: getStatusColor(item.status),
                                            fontWeight: 'bold',
                                            my: 0.5
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
} 