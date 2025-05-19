import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Chip, Button, Select, MenuItem, FormControl, InputLabel, Alert, TextField, Snackbar, CircularProgress } from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AddJobForm } from './AddJobForm';
import type { Job } from '../lib/database.types';

// Sorting options
type SortField = 'created_at' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

// Function to migrate responsibilities from metadata/localStorage to the direct column
const migrateResponsibilities = async (job: Job) => {
    try {
        // Skip if job already has direct responsibilities
        if (job.responsibilities) {
            console.log(`Job ${job.id} already has direct responsibilities`, job.responsibilities);
            return;
        }

        let responsibilitiesToMigrate = null;

        // Check for responsibilities in metadata
        if (job.metadata) {
            let metadata: any = {};
            try {
                // Parse if it's a string
                if (typeof job.metadata === 'string') {
                    metadata = JSON.parse(job.metadata);
                } else {
                    metadata = job.metadata;
                }

                // Extract responsibilities from metadata if present
                if (metadata.responsibilities) {
                    responsibilitiesToMigrate = metadata.responsibilities;
                    console.log(`Found responsibilities in metadata for job ${job.id}`, responsibilitiesToMigrate);
                }
            } catch (e) {
                console.error('Error parsing metadata', e);
            }
        }

        // Check dedicated localStorage key if not found in metadata
        if (!responsibilitiesToMigrate) {
            try {
                const localRespData = localStorage.getItem(`job_${job.id}_responsibilities`);
                if (localRespData) {
                    const respObj = JSON.parse(localRespData);
                    if (respObj.responsibilities) {
                        responsibilitiesToMigrate = respObj.responsibilities;
                        console.log(`Found responsibilities in dedicated localStorage for job ${job.id}`, responsibilitiesToMigrate);
                    }
                }
            } catch (e) {
                console.error('Error retrieving dedicated responsibilities from localStorage', e);
            }
        }

        // Check regular localStorage metadata if still not found
        if (!responsibilitiesToMigrate) {
            const localMetadata = localStorage.getItem(`job_${job.id}_metadata`);
            if (localMetadata) {
                try {
                    const metadata = JSON.parse(localMetadata);
                    if (metadata.responsibilities) {
                        responsibilitiesToMigrate = metadata.responsibilities;
                        console.log(`Found responsibilities in localStorage metadata for job ${job.id}`, responsibilitiesToMigrate);
                    }
                } catch (e) {
                    console.error('Error parsing localStorage metadata', e);
                }
            }
        }

        // If we found responsibilities to migrate, update the job using multiple methods
        if (responsibilitiesToMigrate) {
            console.log(`Migrating responsibilities for job ${job.id}`, responsibilitiesToMigrate);

            // Method 1: Standard update
            try {
                const { error } = await supabaseAdmin
                    .from('jobs')
                    .update({ responsibilities: responsibilitiesToMigrate })
                    .eq('id', job.id);

                if (error) {
                    console.error('Method 1 error migrating responsibilities', error);
                } else {
                    console.log(`Method 1: Successfully migrated responsibilities for job ${job.id}`);
                    return; // Success!
                }
            } catch (err) {
                console.error('Method 1 exception when migrating responsibilities', err);
            }

            // Method 2: Direct SQL via RPC
            try {
                const escapedText = responsibilitiesToMigrate.replace(/'/g, "''");
                await supabaseAdmin.rpc('execute_sql', {
                    sql: `UPDATE jobs SET responsibilities = '${escapedText}' WHERE id = '${job.id}'`
                });
                console.log(`Method 2: Successfully migrated responsibilities for job ${job.id}`);
            } catch (err) {
                console.error('Method 2 error using SQL to migrate responsibilities', err);
            }
        } else {
            console.log(`No responsibilities found to migrate for job ${job.id}`);
        }
    } catch (e) {
        console.error('Error in migration process', e);
    }
};

export function JobsList() {
    const [showAddJob, setShowAddJob] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default to newest first
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showDisplayFixNotice, setShowDisplayFixNotice] = useState(false);
    const [showFallbackData, setShowFallbackData] = useState(false);
    const [manualError, setManualError] = useState<string | null>(null);
    const [manualLoading, setManualLoading] = useState(false);
    const [manualJobs, setManualJobs] = useState<Job[]>([]);

    // Sample fallback job data that matches the Job type from database.types.ts
    const fallbackJobs: Job[] = [
        {
            id: 'sample-1',
            org_id: 'org-1',
            title: 'Senior Software Engineer',
            description: 'We are looking for a skilled software engineer to join our development team.',
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
            responsibilities: '- Develop web applications\n- Write clean code\n- Work with cross-functional teams\n- Mentor junior developers\n- Participate in code reviews',
            metadata: {
                industry: 'Technology',
                location: 'Remote',
                field: 'Software Development',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            },
            industry: 'Technology',
            location: 'Remote',
            field: 'Software Development',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample-2',
            org_id: 'org-1',
            title: 'Product Manager',
            description: 'Join our product team to lead the development of innovative products.',
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            requirements: ['Product Management', 'Agile', 'User Experience', 'Market Research'],
            responsibilities: '- Define product roadmap\n- Gather requirements\n- Work with engineering teams\n- Conduct market research\n- Analyze user feedback',
            metadata: {
                industry: 'Technology',
                location: 'New York, NY',
                field: 'Product Management',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days from now
            },
            industry: 'Technology',
            location: 'New York, NY',
            field: 'Product Management',
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample-3',
            org_id: 'org-1',
            title: 'UX/UI Designer',
            description: 'Design beautiful and intuitive user interfaces for our web and mobile applications.',
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            requirements: ['UI Design', 'Figma', 'User Research', 'Prototyping'],
            responsibilities: '- Create wireframes and prototypes\n- Conduct user research\n- Design user interfaces\n- Work with developers to implement designs\n- Iterate based on feedback',
            metadata: {
                industry: 'Technology',
                location: 'San Francisco, CA',
                field: 'Design',
                deadline: null
            },
            industry: 'Technology',
            location: 'San Francisco, CA',
            field: 'Design',
            deadline: null
        }
    ];

    // Function to manually fetch jobs with fallback data
    const manualFetchJobs = async () => {
        try {
            setManualLoading(true);
            setManualError(null);
            setShowFallbackData(false);

            const { data, error } = await supabaseAdmin
                .from('jobs')
                .select('*')
                .order(sortField, { ascending: sortOrder === 'asc' });

            if (error) {
                console.error('Error fetching jobs manually:', error);
                setManualError(error.message);

                // Show fallback data after a timeout
                setTimeout(() => {
                    setShowFallbackData(true);
                    setManualJobs(fallbackJobs);
                    setManualLoading(false);
                }, 2000);

                return;
            }

            // Process the data similar to the query function
            const processedJobs = data?.map(job => {
                let metadata: {
                    deadline?: string,
                    industry?: string,
                    location?: string,
                    field?: string,
                    responsibilities?: string
                } = {};

                // Extract metadata
                if (job.metadata) {
                    try {
                        if (typeof job.metadata === 'string') {
                            metadata = JSON.parse(job.metadata);
                        } else if (typeof job.metadata === 'object') {
                            metadata = job.metadata;
                        }
                    } catch (e) {
                        console.error('Error parsing metadata for job', job.id, e);
                    }
                }

                // Return the processed job
                return {
                    ...job,
                    deadline: metadata?.deadline || null,
                    industry: metadata?.industry || null,
                    location: metadata?.location || null,
                    field: metadata?.field || null,
                    responsibilities: job.responsibilities || metadata.responsibilities || null
                };
            });

            setManualJobs(processedJobs || []);
            setManualLoading(false);
        } catch (err) {
            console.error('Error in manual jobs fetch:', err);
            setManualError(err instanceof Error ? err.message : String(err));

            // Show fallback data after error
            setTimeout(() => {
                setShowFallbackData(true);
                setManualJobs(fallbackJobs);
                setManualLoading(false);
            }, 2000);
        }
    };

    // Fetch jobs when component mounts or when filters change
    useEffect(() => {
        manualFetchJobs();
    }, [sortField, sortOrder, refreshTrigger]);

    // Use admin client for better permissions
    const { data: jobs, isLoading, error, refetch } = useQuery({
        queryKey: ['jobs', refreshTrigger],
        queryFn: async () => {
            console.log('Fetching jobs...');
            const { data, error } = await supabaseAdmin
                .from('jobs')
                .select('*')
                .order(sortField, { ascending: sortOrder === 'asc' });

            if (error) {
                console.error('Error fetching jobs:', error);
                throw error;
            }

            console.log('Jobs fetched:', data);

            // Process each job to extract metadata and ensure responsibilities display
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
                        console.log(`Raw metadata for job ${job.id}:`, job.metadata);

                        if (typeof job.metadata === 'string') {
                            // Parse if it's a string
                            metadata = JSON.parse(job.metadata);
                            console.log(`Parsed metadata for job ${job.id} from string:`, metadata);
                        } else if (typeof job.metadata === 'object') {
                            // Direct assignment if it's already an object
                            metadata = job.metadata;
                            console.log(`Used object metadata for job ${job.id}:`, metadata);
                        }
                    } catch (e) {
                        console.error('Error parsing metadata for job', job.id, e);
                    }
                } else {
                    console.log(`No metadata found for job ${job.id}`);
                }

                // Make sure we extract the values if they exist
                const industry = metadata?.industry || null;
                const location = metadata?.location || null;
                const field = metadata?.field || null;
                const deadline = metadata?.deadline || null;

                console.log(`Extracted metadata for job ${job.id}:`, {
                    industry, location, field, deadline
                });

                // Return the processed job with all attributes
                return {
                    ...job,
                    deadline: deadline,
                    industry: industry,
                    location: location,
                    field: field,
                    responsibilities: job.responsibilities || metadata.responsibilities || null
                };
            });

            // Log the processed jobs for debugging
            console.log('Processed jobs with metadata:', processedJobs?.map(job => ({
                id: job.id,
                title: job.title,
                industry: job.industry,
                location: job.location,
                field: job.field,
                metadata: job.metadata
            })));

            return processedJobs as Job[];
        },
        staleTime: 5000,
        refetchOnWindowFocus: true,
    });

    // Check if any jobs are missing responsibilities after processing
    useEffect(() => {
        if (jobs) {
            const jobsWithMissingDisplay = jobs.some(job => {
                // Check if job should have responsibilities but doesn't display them
                const hasLocalStorageResp = localStorage.getItem(`job_${job.id}_responsibilities`);
                const hasMetadataResp = job.metadata && typeof job.metadata === 'object' && job.metadata.responsibilities;

                return (hasLocalStorageResp || hasMetadataResp) && !job.responsibilities;
            });

            setShowDisplayFixNotice(jobsWithMissingDisplay);
        }
    }, [jobs]);

    // Apply filters and sort
    const filteredJobs = jobs?.filter(job =>
        statusFilter === 'all' ? true : job.status === statusFilter
    );

    // Apply filters and sort to manually fetched jobs
    const filteredManualJobs = manualJobs?.filter(job =>
        statusFilter === 'all' ? true : job.status === statusFilter
    );

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
        manualFetchJobs(); // Use manual fetch instead of refetch
    };

    // Get sort direction indicator
    const getSortIndicator = (field: SortField) => {
        if (field !== sortField) return '';
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    // Handle when a new job is added
    const handleJobAdded = () => {
        console.log('Job added successfully');

        // Just increment the refresh trigger to cause a re-fetch in the background
        // This is still needed for new jobs since we don't have the new job data yet
        setRefreshTrigger(prev => prev + 1);

        // Close the add job form
        setShowAddJob(false);
    };

    // Delete a job
    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            const { error } = await supabaseAdmin
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;

            // Update the local state by removing the deleted job
            if (jobs) {
                const updatedJobs = jobs.filter(job => job.id !== jobId);

                // Update the cached data
                queryClient.setQueryData(['jobs', refreshTrigger], updatedJobs);
            }

            // Also remove any localStorage items related to this job
            localStorage.removeItem(`job_${jobId}_metadata`);
            localStorage.removeItem(`job_${jobId}_responsibilities`);

            // Refresh the data from the server to ensure UI is up to date
            await refetch();
            // Also trigger a manual fetch to ensure all job data is refreshed
            await manualFetchJobs();
        } catch (err) {
            console.error('Error deleting job:', err);
            alert('Failed to delete job');
        }
    };

    // State for job editing
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Start editing a job
    const handleEditJob = (job: Job) => {
        setEditingJob(job);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingJob(null);
    };

    // Save edited job
    const handleSaveEdit = async (updatedJob: Partial<Job>) => {
        if (!editingJob) return;

        try {
            console.log('Updating job:', editingJob.id, updatedJob);

            // Extract responsibilities for separate update
            const { responsibilities, metadata, ...baseJobData } = updatedJob;

            // Log the extracted data
            console.log('Base job data:', baseJobData);
            console.log('Responsibilities to save:', responsibilities);
            console.log('Metadata to save:', metadata);

            // First update the base job data
            try {
                const { error: baseUpdateError } = await supabaseAdmin
                    .from('jobs')
                    .update(baseJobData)
                    .eq('id', editingJob.id);

                if (baseUpdateError) {
                    console.error('Error updating base job data:', baseUpdateError);
                    throw baseUpdateError;
                }

                console.log('Base job data updated successfully');
            } catch (baseError) {
                console.error('Failed to update base job data:', baseError);
                throw baseError;
            }

            // Then try to update responsibilities separately
            if (responsibilities !== undefined) {
                try {
                    console.log('Updating responsibilities separately:', responsibilities);
                    const { error: respUpdateError } = await supabaseAdmin
                        .from('jobs')
                        .update({ responsibilities })
                        .eq('id', editingJob.id);

                    if (respUpdateError) {
                        console.error('Error updating responsibilities:', respUpdateError);
                        // Don't throw, continue with other updates
                    } else {
                        console.log('Responsibilities updated successfully');
                    }
                } catch (respError) {
                    console.error('Exception when updating responsibilities:', respError);
                    // Continue with other updates
                }
            }

            // Then try to update metadata if available
            if (metadata) {
                try {
                    const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

                    const { error: metadataUpdateError } = await supabaseAdmin
                        .from('jobs')
                        .update({
                            metadata: JSON.stringify(metadataObj)
                        })
                        .eq('id', editingJob.id);

                    if (metadataUpdateError) {
                        console.error('Error updating metadata:', metadataUpdateError);
                        // Save to localStorage as fallback
                        localStorage.setItem(`job_${editingJob.id}_metadata`, JSON.stringify(metadataObj));
                        console.log('Saved metadata to localStorage as fallback');
                    } else {
                        console.log('Metadata updated successfully');
                    }
                } catch (metadataError) {
                    console.error('Exception when updating metadata:', metadataError);
                    // Try to save to localStorage
                    try {
                        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
                        localStorage.setItem(`job_${editingJob.id}_metadata`, JSON.stringify(metadataObj));
                        console.log('Saved metadata to localStorage after database error');
                    } catch (localStorageError) {
                        console.error('Failed to save to localStorage:', localStorageError);
                    }
                }
            }

            // Attempt a raw SQL update as last resort for responsibilities
            if (responsibilities !== undefined) {
                try {
                    // Try direct SQL through RPC
                    await supabaseAdmin.rpc('execute_sql', {
                        sql: `UPDATE jobs SET responsibilities = '${responsibilities.replace(/'/g, "''")}' WHERE id = '${editingJob.id}'`
                    });
                    console.log('Updated responsibilities using direct SQL');
                } catch (sqlError) {
                    console.error('Error with direct SQL update:', sqlError);
                }
            }

            // Success! Update the job in the local state without full page refresh
            console.log('Job update process complete');

            // Parse metadata for the update
            const metadataObj = metadata ?
                (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) :
                {};

            // Create the processed job with updated values
            const updatedProcessedJob = {
                ...editingJob,
                ...baseJobData,
                responsibilities: responsibilities || editingJob.responsibilities,
                metadata: metadataObj,
                // Update extracted metadata fields
                industry: metadataObj?.industry || editingJob.industry,
                location: metadataObj?.location || editingJob.location,
                field: metadataObj?.field || editingJob.field,
                deadline: metadataObj?.deadline || editingJob.deadline
            };

            // Update the jobs array with the edited job
            if (jobs) {
                const updatedJobs = jobs.map(job =>
                    job.id === editingJob.id ? updatedProcessedJob : job
                );

                // Use the queryClient to update the cached data without refetching
                queryClient.setQueryData(['jobs', refreshTrigger], updatedJobs);
            }

            // Clear the editing state
            setEditingJob(null);

            // Refresh the data from the server to ensure UI is up to date
            await refetch();
            // Also trigger a manual fetch to ensure all job data is refreshed
            await manualFetchJobs();
        } catch (err) {
            console.error('Error updating job:', err);
            // Show full error details
            const errorMessage = err instanceof Error
                ? `${err.name}: ${err.message}` + (err.stack ? `\nStack: ${err.stack}` : '')
                : 'Unknown error';
            alert('Failed to update job: ' + errorMessage);
        }
    };

    const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
        try {
            const { error } = await supabaseAdmin
                .from('jobs')
                .update({ status: newStatus })
                .eq('id', jobId);

            if (error) throw error;

            // Update the job in the local state without refetching
            if (jobs) {
                const updatedJobs = jobs.map(job =>
                    job.id === jobId ? { ...job, status: newStatus } : job
                );

                // Update the cached data
                queryClient.setQueryData(['jobs', refreshTrigger], updatedJobs);
            }

            // Refresh the data from the server to ensure UI is up to date
            await refetch();
            // Also trigger a manual fetch to ensure all job data is refreshed
            await manualFetchJobs();
        } catch (err) {
            console.error('Error updating job status:', err);
        }
    };

    const getStatusDisplayName = (status: string) => {
        switch (status) {
            case 'draft': return 'Draft';
            case 'published': return 'Published';
            case 'closed': return 'Closed';
            default: return status;
        }
    };

    // Handle edit form submission
    const handleEditFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        // Create a metadata object with metadata fields
        const metadata = {
            industry: formData.get('industry') as string,
            location: formData.get('location') as string,
            field: formData.get('field') as string,
            deadline: formData.get('deadline') as string,
            // Responsibilities now stored directly in the column, not in metadata
        };

        // Get responsibilities directly
        const responsibilities = formData.get('responsibilities') as string;

        // Parse requirements from text to array
        const requirementsText = formData.get('requirements') as string;
        const requirementsArray = requirementsText
            ? requirementsText.split('\n').map(req => req.trim()).filter(req => req.length > 0)
            : [];

        // Log the form data for debugging
        console.log('Form data:', {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            responsibilities: responsibilities,
            requirements: requirementsArray,
            metadata: metadata
        });

        const updatedJob = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as Job['status'],
            requirements: requirementsArray,
            metadata: JSON.stringify(metadata),
            // Explicitly include responsibilities as a direct field, handle null vs undefined
            responsibilities: responsibilities || undefined
        };

        console.log('Updating job with data:', updatedJob);

        handleSaveEdit(updatedJob);
    };

    if (manualLoading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh" p={4}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>Loading Jobs...</Typography>
            </Box>
        );
    }

    if (manualError && !showFallbackData) {
        return (
            <Box p={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading jobs: {manualError}
                </Alert>
                <Button variant="contained" onClick={manualFetchJobs}>Retry</Button>
            </Box>
        );
    }

    if (isLoading) return <Box p={4}>Loading jobs...</Box>;
    if (error) return <Box p={4} color="error.main">Error loading jobs: {(error as Error).message}</Box>;

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Job Postings</Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowAddJob(!showAddJob)}
                    >
                        {showAddJob ? 'Close Form' : 'Add New Job'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        component="a"
                        href="/fix-jobs"
                    >
                        Fix Job Displays
                    </Button>
                </Box>
            </Box>

            {showAddJob && (
                <Box mb={4}>
                    <AddJobForm onSuccess={handleJobAdded} />
                </Box>
            )}

            {showDisplayFixNotice && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" href="/fix-jobs">
                            Fix Now
                        </Button>
                    }
                >
                    Some jobs may not be displaying all details correctly. Use the Fix Job Displays tool to resolve this.
                </Alert>
            )}

            <Box mb={3} display="flex" flexWrap="wrap" alignItems="center" gap={2}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="status-filter-label">Filter by status</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        label="Filter by status"
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                </FormControl>

                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium">Sort by:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            variant={sortField === 'created_at' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleSortChange('created_at')}
                        >
                            Date{getSortIndicator('created_at')}
                        </Button>
                        <Button
                            variant={sortField === 'title' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleSortChange('title')}
                        >
                            Title{getSortIndicator('title')}
                        </Button>
                        <Button
                            variant={sortField === 'status' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handleSortChange('status')}
                        >
                            Status{getSortIndicator('status')}
                        </Button>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => refetch()}
                    sx={{ marginLeft: 'auto' }}
                >
                    Refresh List
                </Button>
            </Box>

            {/* Job Statistics Bar */}
            {manualJobs && manualJobs.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        mb: 3,
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: '#f5f5f7',
                        border: '1px solid #e0e0e0'
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {manualJobs.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Jobs
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                            {manualJobs.filter(job => job.status === 'published').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Published
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main" fontWeight="bold">
                            {manualJobs.filter(job => job.status === 'draft').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Draft
                        </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="error.main" fontWeight="bold">
                            {manualJobs.filter(job => job.status === 'closed').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Closed
                        </Typography>
                    </Box>
                </Box>
            )}

            {filteredManualJobs?.length === 0 ? (
                <Alert severity="info">No jobs found. Add a new job to get started.</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredManualJobs?.map(job => (
                        <Box key={job.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, p: 3, boxShadow: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="h5" fontWeight="600">{job.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Posted: {new Date(job.created_at).toLocaleDateString()}
                                        {job.created_at && new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>

                                    {/* Display deadline if it's available in the data */}
                                    {job.deadline && (
                                        <Typography variant="body2" sx={{
                                            color: 'error.main',
                                            fontWeight: 'medium'
                                        }}>
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </Typography>
                                    )}

                                    {/* If no deadline field in DB, show a calculated one instead */}
                                    {!job.deadline && (
                                        <Typography variant="body2" sx={{
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}>
                                            Deadline: {new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} (30 days from posting)
                                        </Typography>
                                    )}

                                    {/* Display additional fields from metadata if available */}
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
                                </Box>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <Select
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(job.id, e.target.value as Job['status'])}
                                        size="small"
                                    >
                                        <MenuItem value="draft">Draft</MenuItem>
                                        <MenuItem value="published">Published</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
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

                            {/* Display requirements in a similar format to responsibilities */}
                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="600" mb={1}>Required Skills:</Typography>
                                <Typography variant="body2" sx={{
                                    whiteSpace: 'pre-line',
                                    bgcolor: '#f9f9f9',
                                    p: 2,
                                    borderRadius: 1,
                                    border: '1px solid #eee'
                                }}>
                                    {job.requirements.join('\n')}
                                </Typography>
                            </Box>

                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleEditJob(job)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteJob(job.id)}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Edit Job Modal/Form */}
            {editingJob && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            p: 3,
                            borderRadius: 2,
                            width: '100%',
                            maxWidth: 600,
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>Edit Job</Typography>
                        <Box component="form" onSubmit={handleEditFormSubmit}>
                            <TextField
                                name="title"
                                label="Job Title"
                                defaultValue={editingJob.title}
                                fullWidth
                                margin="normal"
                                required
                            />
                            <TextField
                                name="description"
                                label="Description (Overview)"
                                defaultValue={editingJob.description}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                required
                                helperText="Provide a general overview of the position"
                            />
                            <TextField
                                name="responsibilities"
                                label="Responsibilities"
                                defaultValue={editingJob.responsibilities || ''}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                helperText="List the key responsibilities of this position"
                            />

                            <TextField
                                name="requirements"
                                label="Requirements"
                                defaultValue={editingJob.requirements.join('\n')}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                helperText="List the key requirements for this position (one per line)"
                                required
                            />

                            {/* Add metadata fields */}
                            <TextField
                                name="industry"
                                label="Industry"
                                defaultValue={editingJob.industry || ''}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                name="location"
                                label="Location"
                                defaultValue={editingJob.location || ''}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                name="field"
                                label="Field"
                                defaultValue={editingJob.field || ''}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                name="deadline"
                                label="Deadline"
                                type="date"
                                defaultValue={editingJob.deadline ? new Date(editingJob.deadline).toISOString().split('T')[0] : ''}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <FormControl fullWidth margin="normal">
                                <InputLabel id="edit-status-label">Status</InputLabel>
                                <Select
                                    labelId="edit-status-label"
                                    name="status"
                                    defaultValue={editingJob.status}
                                    label="Status"
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="published">Published</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
} 