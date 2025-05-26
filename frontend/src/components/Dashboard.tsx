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
    Button
} from '@mui/material';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Import Firebase config
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';

// Define types for our statistics
interface DashboardStats {
    totalUsers: number;
    totalCandidates: number;
    totalJobs: number;
    // We can add more complex stats later as we migrate more data
    // recentCandidates: number;
    // popularEducationLevels: { level: string; count: number }[];
    // popularLocations: { location: string; count: number }[];
    // jobsByStatus: { status: string; count: number }[];
}

// Fallback data in case of errors or empty database
const fallbackStats: DashboardStats = {
    totalUsers: 0,
    totalCandidates: 0,
    totalJobs: 0,
};

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>(fallbackStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch total users
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersCount = usersSnapshot.size;

            // Fetch total candidates
            const candidatesCollection = collection(db, 'candidates');
            const candidatesSnapshot = await getDocs(candidatesCollection);
            const candidatesCount = candidatesSnapshot.size;

            // Fetch total jobs
            const jobsCollection = collection(db, 'jobs');
            const jobsSnapshot = await getDocs(jobsCollection);
            const jobsCount = jobsSnapshot.size;

            setStats({
                totalUsers: usersCount,
                totalCandidates: candidatesCount,
                totalJobs: jobsCount,
            });

        } catch (err: any) {
            console.error('Error fetching dashboard stats from Firebase:', err);
            setError('Failed to load dashboard statistics. Displaying zeros.');
            setStats(fallbackStats); // Show fallback (zeros) on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Helper to create stat cards
    const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: color, color: 'white', height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {icon}
                        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                            {title}
                        </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading Dashboard Data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleAltIcon sx={{ fontSize: 30 }} />} color="#1976d2" />
                <StatCard title="Total Candidates" value={stats.totalCandidates} icon={<AssignmentIndIcon sx={{ fontSize: 30 }} />} color="#388e3c" />
                <StatCard title="Total Jobs" value={stats.totalJobs} icon={<WorkIcon sx={{ fontSize: 30 }} />} color="#f57c00" />
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h5" gutterBottom>
                    System Overview
                </Typography>
                <Typography paragraph>
                    Welcome to the Admin Dashboard. The system is now connected to Firebase.
                    Currently, we are displaying basic counts from the main data collections.
                    More detailed statistics and features will be added as the migration progresses.
                </Typography>
                <Typography paragraph>
                    You can use the Firebase Emulator UI (usually at <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">http://localhost:4000</a>) to view and manage the data in Firestore directly.
                </Typography>
                <Button variant="outlined" onClick={fetchDashboardStats} disabled={loading}>
                    Refresh Stats
                </Button>
            </Paper>

            {/* Placeholder for future charts or more detailed stats modules */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Recent Activity (Placeholder)</Typography>
                            <Typography color="textSecondary">
                                Detailed activity logs and charts will be available here soon.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">System Health (Placeholder)</Typography>
                            <Typography color="textSecondary">
                                Monitoring for database connections, API latencies etc.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Box>
    );
} 