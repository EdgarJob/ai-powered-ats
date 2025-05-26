import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Chip, Button, Select, MenuItem, FormControl, InputLabel, Alert, TextField, Snackbar, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddJobForm } from './AddJobForm';
import { getJobs, updateJob, deleteJob } from '../lib/job-service';
import type { Job } from '../lib/job-service';
import { JOB_CATEGORIES, DATE_RANGES, getDateRangeFilter, getCategoryById } from '../lib/categories';

// Sorting options
type SortField = 'createdAt' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

// Renamed and updated to work with Firebase
const migrateResponsibilities = async (job: Job) => {
    console.log('Migration not needed with Firebase - using direct data model');
    return;
};

export function JobsList() {
    const [showAddJob, setShowAddJob] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default to newest first
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showDisplayFixNotice, setShowDisplayFixNotice] = useState(false);
    const [showFallbackData, setShowFallbackData] = useState(false);
    const [manualError, setManualError] = useState<string | null>(null);
    const [manualLoading, setManualLoading] = useState(false);
    const [manualJobs, setManualJobs] = useState<Job[]>([]);

    // Sample fallback job data that matches our Firebase Job type
    const fallbackJobs: Job[] = [
        {
            id: 'sample-1',
            title: 'Senior Software Engineer',
            company: 'Tech Company Inc.',
            location: 'Remote',
            description: 'We are looking for a skilled software engineer to join our development team.',
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
            responsibilities: ['Develop web applications', 'Write clean code', 'Work with cross-functional teams', 'Mentor junior developers', 'Participate in code reviews'],
            salary: {
                min: 120000,
                max: 160000,
                currency: 'USD'
            },
            employmentType: 'Full-time',
            metadata: {
                industry: 'Technology',
                field: 'Software Development',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
        },
        {
            id: 'sample-2',
            title: 'Product Manager',
            company: 'Tech Company Inc.',
            location: 'New York, NY',
            description: 'Join our product team to lead the development of innovative products.',
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            requirements: ['Product Management', 'Agile', 'User Experience', 'Market Research'],
            responsibilities: ['Define product roadmap', 'Gather requirements', 'Work with engineering teams', 'Conduct market research', 'Analyze user feedback'],
            salary: {
                min: 130000,
                max: 170000,
                currency: 'USD'
            },
            employmentType: 'Full-time',
            metadata: {
                industry: 'Technology',
                field: 'Product Management',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
            }
        },
        {
            id: 'sample-3',
            title: 'UX/UI Designer',
            company: 'Tech Company Inc.',
            location: 'San Francisco, CA',
            description: 'Design beautiful and intuitive user interfaces for our web and mobile applications.',
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            requirements: ['UI Design', 'Figma', 'User Research', 'Prototyping'],
            responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Design user interfaces', 'Work with developers to implement designs', 'Iterate based on feedback'],
            employmentType: 'Contract',
            metadata: {
                industry: 'Technology',
                field: 'Design'
            }
        }
    ];

    // Function to manually fetch jobs using our new Firebase service
    const fetchJobs = async () => {
        setManualLoading(true);
        try {
            let result;
            if (statusFilter === 'all') {
                result = await getJobs();
            } else {
                result = await getJobs({ status: statusFilter as 'draft' | 'published' | 'closed' });
            }

            // Apply client-side filtering
            let filteredJobs = result;

            // Filter by category
            if (categoryFilter !== 'all') {
                filteredJobs = filteredJobs.filter(job => job.category === categoryFilter);
            }

            // Filter by date range
            if (dateRangeFilter !== 'all') {
                const dateFilter = getDateRangeFilter(
                    dateRangeFilter,
                    customStartDate ? new Date(customStartDate) : undefined,
                    customEndDate ? new Date(customEndDate) : undefined
                );

                if (dateFilter.startDate || dateFilter.endDate) {
                    filteredJobs = filteredJobs.filter(job => {
                        const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt);

                        if (dateFilter.startDate && jobDate < dateFilter.startDate) {
                            return false;
                        }
                        if (dateFilter.endDate && jobDate > dateFilter.endDate) {
                            return false;
                        }
                        return true;
                    });
                }
            }

            // Sort the jobs
            const sortedJobs = sortJobs(filteredJobs);
            setManualJobs(sortedJobs);
            return sortedJobs;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setManualError(error instanceof Error ? error.message : 'Error fetching jobs');
            setShowFallbackData(true);
            return fallbackJobs;
        } finally {
            setManualLoading(false);
        }
    };

    // Sort jobs function
    const sortJobs = (jobs: Job[]) => {
        return [...jobs].sort((a, b) => {
            if (sortField === 'title') {
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (sortField === 'status') {
                return sortOrder === 'asc'
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            } else { // createdAt
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                return sortOrder === 'asc'
                    ? dateA.getTime() - dateB.getTime()
                    : dateB.getTime() - dateA.getTime();
            }
        });
    };

    // We use useQuery from React Query for data fetching and caching
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs', statusFilter, categoryFilter, dateRangeFilter, customStartDate, customEndDate, sortField, sortOrder, refreshTrigger],
        queryFn: fetchJobs,
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    // Handle sort change
    const handleSortChange = (field: SortField) => {
        if (field === sortField) {
            // If clicking the same field, toggle the order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking a different field, set it and default to ascending
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Get sort indicator
    const getSortIndicator = (field: SortField) => {
        if (field !== sortField) return null;
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    // Handle job added
    const handleJobAdded = () => {
        setShowAddJob(false);
        setRefreshTrigger(prev => prev + 1);
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
    };

    // Handle cancel add job
    const handleCancelAddJob = () => {
        setShowAddJob(false);
    };

    // Handle delete job
    const handleDeleteJob = async (jobId: string) => {
        try {
            await deleteJob(jobId);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting job:', error);
            setManualError(error instanceof Error ? error.message : 'Error deleting job');
        }
    };

    // Handle edit job
    const handleEditJob = (job: Job) => {
        navigate(`/admin/jobs/edit/${job.id}`);
    };

    // Handle status change
    const handleStatusChange = async (jobId: string, newStatus: 'draft' | 'published' | 'closed') => {
        try {
            await updateJob(jobId, { status: newStatus });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error updating job status:', error);
            setManualError(error instanceof Error ? error.message : 'Error updating job status');
        }
    };

    // Get status display name
    const getStatusDisplayName = (status: string) => {
        switch (status) {
            case 'draft': return 'Draft';
            case 'published': return 'Published';
            case 'closed': return 'Closed';
            default: return status;
        }
    };

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Job Listings</Typography>
                <Button
                    variant="contained"
                    onClick={() => setShowAddJob(true)}
                    sx={{ mb: 2 }}
                >
                    Add New Job
                </Button>
            </Box>

            {manualError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {manualError}
                </Alert>
            )}

            {showFallbackData && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Using fallback data because there was an error connecting to the database.
                </Alert>
            )}

            {/* Filter Controls */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'closed')}
                        label="Filter by Status"
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Filter by Category"
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        {JOB_CATEGORIES.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="date-filter-label">Filter by Date</InputLabel>
                    <Select
                        labelId="date-filter-label"
                        value={dateRangeFilter}
                        onChange={(e) => setDateRangeFilter(e.target.value)}
                        label="Filter by Date"
                    >
                        {DATE_RANGES.map((range) => (
                            <MenuItem key={range.id} value={range.id}>
                                {range.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {dateRangeFilter === 'custom' && (
                    <>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                        />
                    </>
                )}
            </Box>

            {/* Sorting options */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                    variant={sortField === 'title' ? 'contained' : 'outlined'}
                    onClick={() => handleSortChange('title')}
                >
                    Sort by Title{getSortIndicator('title')}
                </Button>
                <Button
                    variant={sortField === 'status' ? 'contained' : 'outlined'}
                    onClick={() => handleSortChange('status')}
                >
                    Sort by Status{getSortIndicator('status')}
                </Button>
                <Button
                    variant={sortField === 'createdAt' ? 'contained' : 'outlined'}
                    onClick={() => handleSortChange('createdAt')}
                >
                    Sort by Date{getSortIndicator('createdAt')}
                </Button>
            </Box>

            {isLoading || manualLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : jobs && jobs.length > 0 ? (
                <Box>
                    {jobs.map((job) => (
                        <Box
                            key={job.id}
                            sx={{
                                mb: 2,
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                backgroundColor: '#fff'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">{job.title}</Typography>
                                <Chip
                                    label={getStatusDisplayName(job.status)}
                                    color={
                                        job.status === 'published' ? 'success' :
                                            job.status === 'draft' ? 'default' : 'error'
                                    }
                                />
                            </Box>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {job.location} • {job.company}
                            </Typography>

                            {job.category && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Category:</strong> {getCategoryById(job.category)?.name || job.category}
                                    {job.subcategory && ` • ${job.subcategory}`}
                                </Typography>
                            )}

                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Created: {job.createdAt instanceof Date
                                    ? job.createdAt.toLocaleDateString()
                                    : new Date(job.createdAt).toLocaleDateString()}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleEditJob(job)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeleteJob(job.id)}
                                >
                                    Delete
                                </Button>

                                {/* Status change buttons */}
                                {job.status !== 'draft' && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleStatusChange(job.id, 'draft')}
                                    >
                                        Move to Draft
                                    </Button>
                                )}
                                {job.status !== 'published' && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        onClick={() => handleStatusChange(job.id, 'published')}
                                    >
                                        Publish
                                    </Button>
                                )}
                                {job.status !== 'closed' && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleStatusChange(job.id, 'closed')}
                                    >
                                        Close Job
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                    No jobs found. Create a new job listing to get started.
                </Typography>
            )}

            {/* Add Job Dialog */}
            {showAddJob && (
                <AddJobForm
                    open={showAddJob}
                    onClose={handleCancelAddJob}
                    onJobAdded={handleJobAdded}
                />
            )}
        </Box>
    );
} 