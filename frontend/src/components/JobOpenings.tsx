import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Alert, TextField, Card, CardContent, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { supabaseAdmin, supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../lib/database.types';

// Sorting options
type SortField = 'created_at' | 'title';
type SortOrder = 'asc' | 'desc';

export function JobOpenings() {
    const [industryFilter, setIndustryFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [fieldFilter, setFieldFilter] = useState<string>('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default to newest first
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const navigate = useNavigate();

    // Get current date for deadline comparisons
    const today = new Date();

    // Use supabaseAdmin client to ensure we can access all published jobs
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['job-openings', refreshTrigger, sortField, sortOrder],
        queryFn: async () => {
            console.log('Fetching job openings...');

            // Only fetch published jobs using admin client
            const { data, error } = await supabaseAdmin
                .from('jobs')
                .select('*')
                .eq('status', 'published')
                .order(sortField, { ascending: sortOrder === 'asc' });

            if (error) {
                console.error('Error fetching job openings:', error);
                throw error;
            }

            console.log('Job openings fetched:', data);

            // Process each job to extract metadata and format for display
            const processedJobs = data?.map(job => {
                let metadata: {
                    deadline?: string,
                    industry?: string,
                    location?: string,
                    field?: string,
                    responsibilities?: string
                } = {};

                // Extract metadata - handle both string and object formats
                if (job.metadata) {
                    try {
                        if (typeof job.metadata === 'string') {
                            // Parse if it's a string
                            metadata = JSON.parse(job.metadata);
                        } else if (typeof job.metadata === 'object') {
                            // Direct assignment if it's already an object
                            metadata = job.metadata;
                        }
                    } catch (e) {
                        console.error('Error parsing metadata for job', job.id, e);
                    }
                }

                // Extract values from metadata
                const industry = metadata?.industry || null;
                const location = metadata?.location || null;
                const field = metadata?.field || null;
                const deadline = metadata?.deadline || null;

                // Format the processed job data
                return {
                    ...job,
                    deadline: deadline,
                    industry: industry,
                    location: location,
                    field: field,
                    responsibilities: job.responsibilities || metadata.responsibilities || null
                };
            });

            return processedJobs as Job[];
        },
        staleTime: 10000,
        refetchOnWindowFocus: true,
    });

    // Get unique values for filters
    const uniqueIndustries = ['all', ...new Set(jobs?.map(job => job.industry).filter(Boolean))] as string[];
    const uniqueLocations = ['all', ...new Set(jobs?.map(job => job.location).filter(Boolean))] as string[];
    const uniqueFields = ['all', ...new Set(jobs?.map(job => job.field).filter(Boolean))] as string[];

    // Apply filters and search
    const filteredJobs = jobs?.filter(job => {
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
        // Check if user is authenticated
        const { data } = await supabase.auth.getUser();

        if (data.user) {
            // User is authenticated, navigate to application page
            navigate(`/apply/${jobId}`);
        } else {
            // User is not authenticated, show login/register dialog
            setSelectedJobId(jobId);
            setIsLoginDialogOpen(true);
        }
    };

    // Handle login action
    const handleLogin = () => {
        setIsLoginDialogOpen(false);
        // Navigate to login page with return URL
        navigate('/register', { state: { returnTo: selectedJobId ? `/apply/${selectedJobId}` : '/' } });
    };

    // Check if a job deadline has passed
    const isDeadlinePassed = (deadline: string) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        return deadlineDate < today;
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4} color="error.main">
                Error loading job openings: {(error as Error).message}
            </Box>
        );
    }

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
            {filteredJobs?.length === 0 ? (
                <Alert severity="info">No job openings match your filters. Try adjusting your search criteria.</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredJobs?.map(job => (
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

            {/* Login Dialog */}
            <Dialog open={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)}>
                <DialogTitle>Authentication Required</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        You need to be logged in to apply for this job. Would you like to login or register now?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsLoginDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogin}
                    >
                        Login / Register
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 