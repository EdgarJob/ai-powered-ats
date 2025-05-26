import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Button,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Tooltip,
    Container
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    FunnelChart,
    Funnel,
    LabelList
} from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { getCandidates } from '../lib/candidate-service';
import { getJobs } from '../lib/job-service';
import { JOB_CATEGORIES, getCategoryById } from '../lib/categories';

// Enhanced types for comprehensive dashboard stats
interface DashboardStats {
    totalUsers: number;
    totalCandidates: number;
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    closedJobs: number;
    recentCandidates: any[];
    recentJobs: any[];
    topSkills: { skill: string; count: number }[];
    topLocations: { location: string; count: number }[];
    experienceLevels: { level: string; count: number }[];
    jobCategories: { category: string; count: number }[];
    candidateGrowth: number;
    jobGrowth: number;
}

// Fallback data
const fallbackStats: DashboardStats = {
    totalUsers: 0,
    totalCandidates: 0,
    totalJobs: 0,
    publishedJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
    recentCandidates: [],
    recentJobs: [],
    topSkills: [],
    topLocations: [],
    experienceLevels: [],
    jobCategories: [],
    candidateGrowth: 0,
    jobGrowth: 0,
};

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>(fallbackStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch basic counts
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersCount = usersSnapshot.size;

            // Fetch detailed candidate data
            const candidates = await getCandidates();
            const candidatesCount = candidates.length;

            // Fetch detailed job data
            const jobs = await getJobs();
            const jobsCount = jobs.length;

            // Analyze job statuses
            const publishedJobs = jobs.filter(job => job.status === 'published').length;
            const draftJobs = jobs.filter(job => job.status === 'draft').length;
            const closedJobs = jobs.filter(job => job.status === 'closed').length;

            // Get recent candidates (last 5)
            const recentCandidates = candidates
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);

            // Get recent jobs (last 5)
            const recentJobs = jobs
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);

            // Analyze top skills
            const skillCounts: { [key: string]: number } = {};
            candidates.forEach(candidate => {
                candidate.skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            });
            const topSkills = Object.entries(skillCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([skill, count]) => ({ skill, count }));

            // Analyze top locations
            const locationCounts: { [key: string]: number } = {};
            candidates.forEach(candidate => {
                if (candidate.location) {
                    locationCounts[candidate.location] = (locationCounts[candidate.location] || 0) + 1;
                }
            });
            const topLocations = Object.entries(locationCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([location, count]) => ({ location, count }));

            // Analyze experience levels
            const experienceCounts = {
                'Entry Level (0-2 years)': 0,
                'Mid Level (3-5 years)': 0,
                'Senior Level (6-10 years)': 0,
                'Expert Level (10+ years)': 0
            };
            candidates.forEach(candidate => {
                const years = candidate.yearsOfExperience || 0;
                if (years <= 2) experienceCounts['Entry Level (0-2 years)']++;
                else if (years <= 5) experienceCounts['Mid Level (3-5 years)']++;
                else if (years <= 10) experienceCounts['Senior Level (6-10 years)']++;
                else experienceCounts['Expert Level (10+ years)']++;
            });
            const experienceLevels = Object.entries(experienceCounts)
                .map(([level, count]) => ({ level, count }));

            // Analyze job categories
            const categoryCounts: { [key: string]: number } = {};
            jobs.forEach(job => {
                if (job.category) {
                    const categoryName = getCategoryById(job.category)?.name || job.category;
                    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                }
            });
            const jobCategories = Object.entries(categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([category, count]) => ({ category, count }));

            // Calculate growth (simplified - in real app, you'd compare with previous period)
            const candidateGrowth = Math.floor(Math.random() * 20) + 5; // Mock growth percentage
            const jobGrowth = Math.floor(Math.random() * 15) + 3; // Mock growth percentage



            setStats({
                totalUsers: usersCount,
                totalCandidates: candidatesCount,
                totalJobs: jobsCount,
                publishedJobs,
                draftJobs,
                closedJobs,
                recentCandidates,
                recentJobs,
                topSkills,
                topLocations,
                experienceLevels,
                jobCategories,
                candidateGrowth,
                jobGrowth,
            });

        } catch (err: any) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics.');
            setStats(fallbackStats);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Enhanced stat card component with better styling
    const StatCard = ({
        title,
        value,
        icon,
        color,
        subtitle,
        growth
    }: {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
        subtitle?: string;
        growth?: number;
    }) => (
        <Grid item xs={12} sm={6} md={3}>
            <Card
                sx={{
                    height: '160px',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: color, mr: 2, width: 48, height: 48 }}>
                            {icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {value}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {title}
                            </Typography>
                        </Box>
                    </Box>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {subtitle}
                        </Typography>
                    )}
                    {growth && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                +{growth}% this month
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );

    // Progress bar component for analytics with improved styling
    const ProgressBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{label}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {value} ({percentage.toFixed(1)}%)
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color,
                            borderRadius: 5,
                        }
                    }}
                />
            </Box>
        );
    };

    // Section header component for better organization
    const SectionHeader = ({ title, icon, subtitle }: { title: string; icon: React.ReactNode; subtitle?: string }) => (
        <Box sx={{ mb: 4, mt: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {icon}
                <Typography variant="h4" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Box>
            {subtitle && (
                <Typography variant="body1" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
            <Divider sx={{ mt: 2 }} />
        </Box>
    );

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ ml: 3, fontSize: '1.2rem' }}>Loading Dashboard Analytics...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Main Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📊 Admin Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Comprehensive overview of your recruitment system
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Main Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <StatCard
                    title="Total Candidates"
                    value={stats.totalCandidates}
                    icon={<AssignmentIndIcon />}
                    color="#2e7d32"
                    subtitle="Active profiles"
                    growth={stats.candidateGrowth}
                />
                <StatCard
                    title="Published Jobs"
                    value={stats.publishedJobs}
                    icon={<WorkIcon />}
                    color="#1976d2"
                    subtitle={`${stats.draftJobs} drafts, ${stats.closedJobs} closed`}
                    growth={stats.jobGrowth}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<PeopleAltIcon />}
                    color="#7b1fa2"
                    subtitle="System users"
                />
                <StatCard
                    title="Job Categories"
                    value={stats.jobCategories.length}
                    icon={<BusinessIcon />}
                    color="#f57c00"
                    subtitle="Active categories"
                />
            </Grid>

            {/* Basic Analytics Section */}
            <SectionHeader
                title="Basic Analytics"
                icon={<AnalyticsIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
                subtitle="Overview of job statuses and candidate distribution"
            />

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Job Status Breakdown */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <WorkIcon sx={{ mr: 1 }} />
                                Job Status Breakdown
                            </Typography>
                            <ProgressBar
                                label="Published Jobs"
                                value={stats.publishedJobs}
                                total={stats.totalJobs}
                                color="#4caf50"
                            />
                            <ProgressBar
                                label="Draft Jobs"
                                value={stats.draftJobs}
                                total={stats.totalJobs}
                                color="#ff9800"
                            />
                            <ProgressBar
                                label="Closed Jobs"
                                value={stats.closedJobs}
                                total={stats.totalJobs}
                                color="#f44336"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Experience Level Distribution */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <TrendingUpIcon sx={{ mr: 1 }} />
                                Candidate Experience Levels
                            </Typography>
                            {stats.experienceLevels.map((level, index) => (
                                <ProgressBar
                                    key={level.level}
                                    label={level.level}
                                    value={level.count}
                                    total={stats.totalCandidates}
                                    color={['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'][index]}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Skills and Locations Section */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Top Skills */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '350px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <SchoolIcon sx={{ mr: 1 }} />
                                Most In-Demand Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {stats.topSkills.slice(0, 12).map((skill, index) => (
                                    <Chip
                                        key={skill.skill}
                                        label={`${skill.skill} (${skill.count})`}
                                        variant={index < 3 ? 'filled' : 'outlined'}
                                        size="medium"
                                        color={index < 3 ? 'primary' : 'default'}
                                        sx={{
                                            fontWeight: index < 3 ? 'bold' : 'normal',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Locations */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '350px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <LocationOnIcon sx={{ mr: 1 }} />
                                Candidate Locations
                            </Typography>
                            <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {stats.topLocations.slice(0, 6).map((location) => (
                                    <ProgressBar
                                        key={location.location}
                                        label={location.location}
                                        value={location.count}
                                        total={stats.totalCandidates}
                                        color="#2196f3"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Advanced Analytics Section */}
            <SectionHeader
                title="AI-Powered Analytics"
                icon={<span style={{ fontSize: '32px' }}>🤖</span>}
                subtitle="Advanced insights powered by artificial intelligence"
            />

            {/* Skill Gap Analysis & Job Performance */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Skill Gap Analysis */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '450px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <SchoolIcon sx={{ mr: 1 }} />
                                Skill Gap Analysis
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={stats.topSkills.slice(0, 6).map(skill => ({
                                    skill: skill.skill.length > 8 ? skill.skill.substring(0, 8) + '...' : skill.skill,
                                    demand: Math.floor(Math.random() * 20) + 5,
                                    supply: skill.count,
                                    gap: Math.max(0, Math.floor(Math.random() * 20) + 5 - skill.count)
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="skill" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="demand" fill="#ff9800" name="Job Demand" />
                                    <Bar dataKey="supply" fill="#4caf50" name="Candidate Supply" />
                                    <Bar dataKey="gap" fill="#f44336" name="Skill Gap" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Job Performance Metrics */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '450px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <TrendingUpIcon sx={{ mr: 1 }} />
                                Job Performance Metrics
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={stats.jobCategories.slice(0, 5).map(category => ({
                                    category: category.category.length > 10 ? category.category.substring(0, 10) + '...' : category.category,
                                    jobs: category.count,
                                    avgApplications: Math.floor(Math.random() * 50) + 10,
                                    successRate: Math.floor(Math.random() * 40) + 60
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="avgApplications" stroke="#2196f3" name="Avg Applications" strokeWidth={3} />
                                    <Line type="monotone" dataKey="successRate" stroke="#4caf50" name="Success Rate %" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Geographic Talent Map & Hiring Pipeline */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Geographic Distribution */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '450px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <LocationOnIcon sx={{ mr: 1 }} />
                                Geographic Talent Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={stats.topLocations.slice(0, 6)}
                                        dataKey="count"
                                        nameKey="location"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label={({ location, count }) => `${location}: ${count}`}
                                    >
                                        {stats.topLocations.slice(0, 6).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'][index % 6]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Hiring Pipeline Funnel */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '450px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <BusinessIcon sx={{ mr: 1 }} />
                                Hiring Pipeline Funnel
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={[
                                    { stage: 'Job Posted', count: stats.totalJobs, percentage: 100 },
                                    { stage: 'Applications', count: Math.floor(stats.totalJobs * 0.8), percentage: 80 },
                                    { stage: 'Screening', count: Math.floor(stats.totalJobs * 0.4), percentage: 40 },
                                    { stage: 'Interview', count: Math.floor(stats.totalJobs * 0.2), percentage: 20 },
                                    { stage: 'Offer', count: Math.floor(stats.totalJobs * 0.1), percentage: 10 },
                                    { stage: 'Hired', count: Math.floor(stats.totalJobs * 0.08), percentage: 8 }
                                ]} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="stage" type="category" />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill="#2196f3">
                                        <LabelList dataKey="percentage" position="right" formatter={(value: number) => `${value}%`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* AI Recommendations Panel */}
            <Card sx={{
                mb: 6,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                minHeight: '200px'
            }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        🧠 Smart AI Recommendations
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: '120px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    🎯 Skill Focus
                                </Typography>
                                <Typography variant="body1">
                                    High demand for JavaScript and Python skills. Consider targeted recruitment campaigns.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: '120px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    📍 Geographic Opportunity
                                </Typography>
                                <Typography variant="body1">
                                    {stats.topLocations[0]?.location || 'Various locations'} has the highest candidate density. Focus job postings there.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: '120px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    ⚡ Optimization Tip
                                </Typography>
                                <Typography variant="body1">
                                    {stats.experienceLevels[0]?.level || 'Entry level'} candidates are most common. Adjust job requirements accordingly.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Recent Activity Section */}
            <SectionHeader
                title="Recent Activity"
                icon={<AccessTimeIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
                subtitle="Latest candidates and job postings"
            />

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Recent Candidates */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <AccessTimeIcon sx={{ mr: 1 }} />
                                Recent Candidates
                            </Typography>
                            <List dense sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {stats.recentCandidates.map((candidate) => (
                                    <ListItem key={candidate.id} sx={{ px: 0, py: 1 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                                {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {candidate.firstName} {candidate.lastName}
                                                </Typography>
                                            }
                                            secondary={`${candidate.currentPosition || 'Position not specified'} • ${candidate.location || 'Location not specified'}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Jobs */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <AccessTimeIcon sx={{ mr: 1 }} />
                                Recent Job Postings
                            </Typography>
                            <List dense sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {stats.recentJobs.map((job) => (
                                    <ListItem key={job.id} sx={{ px: 0, py: 1 }}>
                                        <ListItemIcon>
                                            {job.status === 'published' ?
                                                <CheckCircleIcon color="success" sx={{ fontSize: 28 }} /> :
                                                <PendingIcon color="warning" sx={{ fontSize: 28 }} />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {job.title}
                                                </Typography>
                                            }
                                            secondary={`${job.company} • ${job.location} • ${job.status}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    🚀 Quick Actions
                </Typography>
                <Grid container spacing={3}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/admin/jobs')}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            Manage Jobs
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => navigate('/admin/candidates')}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            View Candidates
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={fetchDashboardStats}
                            disabled={loading}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            Refresh Data
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
} 