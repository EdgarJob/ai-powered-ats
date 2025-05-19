import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Alert, TextField, Card, CardContent, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Link as MuiLink } from '@mui/material';
import { supabaseAdmin, supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import type { Job } from '../lib/database.types';
import config from '../lib/config';
import { useAuth } from '../lib/AuthContext';

// Sorting options
type SortField = 'created_at' | 'title';
type SortOrder = 'asc' | 'desc';

// Type for job metadata
interface JobMetadata {
    industry?: string;
    location?: string;
    field?: string;
    deadline?: string;
    responsibilities?: string;
    [key: string]: any; // Allow other properties
}

export function JobOpenings() {
    const { user, userRole } = useAuth();
    const [industryFilter, setIndustryFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [fieldFilter, setFieldFilter] = useState<string>('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default to newest first
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [supabaseError, setSupabaseError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [showFallbackContent, setShowFallbackContent] = useState(false);
    const [manualJobs, setManualJobs] = useState<Job[]>([]);
    const [manualLoading, setManualLoading] = useState(true);

    const navigate = useNavigate();

    // Set a timeout for loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 5000); // 5 seconds

        const fallbackTimer = setTimeout(() => {
            setShowFallbackContent(true);
        }, 10000); // 10 seconds

        return () => {
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
        };
    }, []);

    // Manual job fetching
    useEffect(() => {
        const fetchJobsManually = async () => {
            try {
                console.log('Manually fetching jobs...');
                const { data, error } = await supabaseAdmin
                    .from('jobs')
                    .select('*');

                if (error) {
                    console.error('Error fetching jobs manually:', error);
                    setSupabaseError(error.message);

                    // Immediately use fallback data on error
                    console.log('Using fallback jobs due to database error');
                    setManualJobs(fallbackJobs as unknown as Job[]);
                    setShowFallbackContent(true);
                    setManualLoading(false);
                } else {
                    console.log('Manual job fetch successful:', data);

                    // Process the jobs
                    const processedJobs = data.map(job => {
                        let metadata: JobMetadata = {};

                        // Extract metadata
                        if (job.metadata) {
                            try {
                                if (typeof job.metadata === 'string') {
                                    metadata = JSON.parse(job.metadata) as JobMetadata;
                                } else if (typeof job.metadata === 'object') {
                                    metadata = job.metadata as JobMetadata;
                                }
                            } catch (e) {
                                console.error('Error parsing metadata for job', job.id, e);
                            }
                        }

                        return {
                            ...job,
                            industry: metadata.industry || null,
                            location: metadata.location || null,
                            field: metadata.field || null,
                            deadline: metadata.deadline || null,
                            requirements: job.requirements || [],
                            responsibilities: job.responsibilities || metadata.responsibilities || null
                        };
                    });

                    // If no jobs found, use fallback jobs
                    if (processedJobs.length === 0) {
                        console.log('No jobs found, using fallback jobs');
                        setManualJobs(fallbackJobs as unknown as Job[]);
                    } else {
                        setManualJobs(processedJobs);
                    }

                    setManualLoading(false);
                }
            } catch (err) {
                console.error('Exception in manual job fetch:', err);
                setSupabaseError(err instanceof Error ? err.message : String(err));

                // Immediately use fallback data on exception
                console.log('Using fallback jobs due to exception');
                setManualJobs(fallbackJobs as unknown as Job[]);
                setShowFallbackContent(true);
                setManualLoading(false);
            }
        };

        fetchJobsManually();
    }, [refreshTrigger]);

    // Log Supabase configuration for debugging
    useEffect(() => {
        console.log('JobOpenings - Supabase URL:', config.supabaseUrl);
        console.log('JobOpenings - Using service role key?', !!config.supabaseServiceKey);
        console.log('JobOpenings - Environment:', config.environment);

        // Quick check to see if we can fetch any jobs
        const checkJobs = async () => {
            try {
                const { data, error } = await supabaseAdmin
                    .from('jobs')
                    .select('id, status')
                    .limit(10);

                console.log('Quick jobs check result:', { data, error });
                setDebugInfo({ jobsCheck: { data, error } });
            } catch (err) {
                console.error('Error in quick jobs check:', err);
                setDebugInfo({ jobsCheckError: err instanceof Error ? err.message : String(err) });
            }
        };

        checkJobs();
    }, []);

    // Fallback jobs for demonstration
    const fallbackJobs = [
        {
            id: 'sample-1',
            title: 'Software Engineer',
            description: 'We are looking for a skilled software engineer to join our development team.',
            created_at: new Date().toISOString(),
            industry: 'Technology',
            location: 'Remote',
            field: 'Software Development',
            requirements: ['JavaScript', 'React', 'Node.js'],
            responsibilities: '- Develop web applications\n- Write clean code\n- Work with cross-functional teams'
        },
        {
            id: 'sample-2',
            title: 'Product Manager',
            description: 'Join our product team to lead the development of innovative products.',
            created_at: new Date().toISOString(),
            industry: 'Technology',
            location: 'New York, NY',
            field: 'Product Management',
            requirements: ['Product Management', 'Agile', 'User Experience'],
            responsibilities: '- Define product roadmap\n- Gather requirements\n- Work with engineering teams'
        }
    ];

    // Show general error message
    if (supabaseError) {
        return (
            <Box p={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error connecting to database: {supabaseError}
                </Alert>
                <Button variant="contained" onClick={() => {
                    setSupabaseError(null);
                    setRefreshTrigger(prev => prev + 1);
                }} sx={{ mr: 2 }}>
                    Try Again
                </Button>
                <Button
                    component={Link}
                    to="/diagnostics"
                    variant="outlined"
                >
                    Run Diagnostics
                </Button>
                {debugInfo && (
                    <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                        <Typography variant="h6">Debug Information</Typography>
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </Box>
                )}
            </Box>
        );
    }

    if (manualLoading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh" p={4}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>Loading Job Openings...</Typography>

                {loadingTimeout && !showFallbackContent && (
                    <Box mt={3} textAlign="center" maxWidth="600px">
                        <Alert severity="info" sx={{ mb: 2 }}>
                            This is taking longer than expected. We're still trying to connect to the database.
                        </Alert>
                        <Button
                            component={Link}
                            to="/diagnostics"
                            variant="outlined"
                            sx={{ mt: 2 }}
                        >
                            Run Diagnostics
                        </Button>
                    </Box>
                )}

                {showFallbackContent && (
                    <Box mt={3} textAlign="center" maxWidth="600px">
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            We're having trouble connecting to the database. You can view sample job listings below or check the diagnostics page.
                        </Alert>
                        <Box display="flex" justifyContent="center" gap={2} mt={2}>
                            <Button
                                onClick={() => navigate('/diagnostics')}
                                variant="contained"
                            >
                                Run Diagnostics
                            </Button>
                            <Button
                                onClick={() => setRefreshTrigger(prev => prev + 1)}
                                variant="outlined"
                            >
                                Try Again
                            </Button>
                        </Box>

                        {/* Show fallback content */}
                        <Box mt={4}>
                            <Typography variant="h5" gutterBottom>Sample Job Listings</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                These are sample listings while we try to connect to the database.
                            </Typography>

                            {fallbackJobs.map(job => (
                                <Card key={job.id} sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">{job.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {job.location} • {job.industry}
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {job.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }

    // Get unique values for filters
    const uniqueIndustries = ['all', ...new Set(manualJobs.map(job => job.industry).filter(Boolean))] as string[];
    const uniqueLocations = ['all', ...new Set(manualJobs.map(job => job.location).filter(Boolean))] as string[];
    const uniqueFields = ['all', ...new Set(manualJobs.map(job => job.field).filter(Boolean))] as string[];

    // Apply filters and search
    const filteredJobs = manualJobs.filter(job => {
        // Check if the job matches all active filters
        const matchesIndustry = industryFilter === 'all' || job.industry === industryFilter;
        const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
        const matchesField = fieldFilter === 'all' || job.field === fieldFilter;

        // Search term matching (case insensitive)
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            job.title.toLowerCase().includes(searchTermLower) ||
            (job.description && job.description.toLowerCase().includes(searchTermLower)) ||
            (job.responsibilities && job.responsibilities.toLowerCase().includes(searchTermLower)) ||
            (job.industry && job.industry.toLowerCase().includes(searchTermLower)) ||
            (job.location && job.location.toLowerCase().includes(searchTermLower)) ||
            (job.field && job.field.toLowerCase().includes(searchTermLower));

        return matchesIndustry && matchesLocation && matchesField && matchesSearch;
    });

    // Handle sort changes
    const handleSortChange = (field: SortField) => {
        if (field === sortField) {
            // If clicking the same field, toggle the order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking a new field, set it as the sort field and use default order
            setSortField(field);
            // Default order: desc for dates (newest first), asc for text (A to Z)
            setSortOrder(field === 'created_at' ? 'desc' : 'asc');
        }
    };

    // Get sort direction indicator
    const getSortIndicator = (field: SortField) => {
        if (field !== sortField) return '';
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    // Handle apply button click
    const handleApply = async (jobId: string) => {
        // Check if user is logged in
        if (!user) {
            // Set the selected job ID
            setSelectedJobId(jobId);
            // Open the login dialog
            setIsLoginDialogOpen(true);
        } else {
            // User is logged in, navigate to application page
            navigate(`/apply/${jobId}`);
        }
    };

    const handleLogin = () => {
        setIsLoginDialogOpen(false);
        if (selectedJobId) {
            navigate(`/login`, { state: { from: `/apply/${selectedJobId}` } });
        } else {
            navigate('/login');
        }
    };

    const handleRegister = () => {
        setIsLoginDialogOpen(false);
        if (selectedJobId) {
            navigate(`/register`, { state: { returnTo: `/apply/${selectedJobId}` } });
        } else {
            navigate('/register');
        }
    };

    // Get current date for deadline comparisons
    const today = new Date();

    // Check if a job deadline has passed
    const isDeadlinePassed = (deadline: string) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        return deadlineDate < today;
    };

    // Login/Register dialog
    const loginDialog = (
        <Dialog open={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)}>
            <DialogTitle>Create an Account or Login</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    You need to create an account or login to apply for this job.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Creating an account allows you to track your applications and manage your profile.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setIsLoginDialogOpen(false)} color="inherit">
                    Cancel
                </Button>
                <Box>
                    <Button onClick={handleRegister} color="primary" variant="outlined" sx={{ mr: 1 }}>
                        Create Account
                    </Button>
                    <Button onClick={handleLogin} color="primary" variant="contained">
                        Login
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Current Job Openings</Typography>
                <Typography variant="body1" color="text.secondary">Browse our available positions and apply online</Typography>
            </Box>

            {/* Search and Filters */}
            <Box mb={4} p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
                {/* Search */}
                <TextField
                    fullWidth
                    label="Search Jobs"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, description, skills..."
                    sx={{ mb: 3 }}
                />

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    {/* Industry Filter */}
                    <FormControl fullWidth>
                        <InputLabel id="industry-filter-label">Industry</InputLabel>
                        <Select
                            labelId="industry-filter-label"
                            value={industryFilter}
                            label="Industry"
                            onChange={(e) => setIndustryFilter(e.target.value)}
                        >
                            {uniqueIndustries.map((industry) => (
                                <MenuItem key={industry} value={industry}>
                                    {industry === 'all' ? 'All Industries' : industry}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Location Filter */}
                    <FormControl fullWidth>
                        <InputLabel id="location-filter-label">Location</InputLabel>
                        <Select
                            labelId="location-filter-label"
                            value={locationFilter}
                            label="Location"
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            {uniqueLocations.map((location) => (
                                <MenuItem key={location} value={location}>
                                    {location === 'all' ? 'All Locations' : location}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Field Filter */}
                    <FormControl fullWidth>
                        <InputLabel id="field-filter-label">Field</InputLabel>
                        <Select
                            labelId="field-filter-label"
                            value={fieldFilter}
                            label="Field"
                            onChange={(e) => setFieldFilter(e.target.value)}
                        >
                            {uniqueFields.map((field) => (
                                <MenuItem key={field} value={field}>
                                    {field === 'all' ? 'All Fields' : field}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Sort Controls */}
                <Box display="flex" mt={3} alignItems="center">
                    <Typography variant="body2" fontWeight="medium" mr={2}>Sort by:</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant={sortField === 'created_at' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleSortChange('created_at')}
                        >
                            Date Posted{getSortIndicator('created_at')}
                        </Button>
                        <Button
                            variant={sortField === 'title' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleSortChange('title')}
                        >
                            Title{getSortIndicator('title')}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Job Results */}
            {filteredJobs.length === 0 ? (
                <Alert severity="info">No job openings match your filters. Try adjusting your search criteria.</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredJobs.map(job => (
                        <Card key={job.id} sx={{ borderRadius: 2, boxShadow: 2, overflow: 'visible' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="600">{job.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Posted: {new Date(job.created_at).toLocaleDateString()}
                                        </Typography>

                                        {/* Display deadline if available */}
                                        {job.deadline && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: isDeadlinePassed(job.deadline) ? 'error.main' : 'success.main',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                                {isDeadlinePassed(job.deadline) && ' (Expired)'}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Apply Button */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleApply(job.id)}
                                        disabled={job.deadline ? isDeadlinePassed(job.deadline) : false}
                                    >
                                        {job.deadline && isDeadlinePassed(job.deadline) ? 'Deadline Passed' : 'Apply Now'}
                                    </Button>
                                </Box>

                                {/* Job metadata display */}
                                <Box
                                    sx={{
                                        bgcolor: '#f8f9fa',
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0',
                                        mt: 2,
                                        mb: 2,
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                        gap: 2
                                    }}
                                >
                                    {job.industry ? (
                                        <Typography variant="body2">
                                            <strong>Industry:</strong> {job.industry}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Industry:</strong> Not specified
                                        </Typography>
                                    )}

                                    {job.location ? (
                                        <Typography variant="body2">
                                            <strong>Location:</strong> {job.location}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Location:</strong> Not specified
                                        </Typography>
                                    )}

                                    {job.field ? (
                                        <Typography variant="body2">
                                            <strong>Field:</strong> {job.field}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Field:</strong> Not specified
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="body1" mb={2}>{job.description}</Typography>

                                {/* Show responsibilities if available */}
                                {job.responsibilities && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle1" fontWeight="600" mb={1}>Responsibilities:</Typography>
                                        <Typography variant="body2" sx={{
                                            whiteSpace: 'pre-line',
                                            bgcolor: '#f9f9f9',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #eee'
                                        }}>
                                            {job.responsibilities}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Display requirements */}
                                {job.requirements && job.requirements.length > 0 && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle1" fontWeight="600" mb={1}>Required Skills:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {job.requirements.map((req, index) => (
                                                <Chip key={index} label={req} size="small" color="primary" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Apply button at bottom for larger screens */}
                                <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleApply(job.id)}
                                        disabled={job.deadline ? isDeadlinePassed(job.deadline) : false}
                                    >
                                        {job.deadline && isDeadlinePassed(job.deadline) ? 'Deadline Passed' : 'Apply Now'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Add login/register dialog */}
            {loginDialog}
        </Box>
    );
} 