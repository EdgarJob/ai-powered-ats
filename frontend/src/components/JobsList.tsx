import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Chip, Button, Select, MenuItem, FormControl, InputLabel, Alert, TextField } from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AddJobForm } from './AddJobForm';
import type { Job } from '../lib/database.types';

export function JobsList() {
    const [showAddJob, setShowAddJob] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Use admin client for better permissions
    const { data: jobs, isLoading, error, refetch } = useQuery({
        queryKey: ['jobs', refreshTrigger],
        queryFn: async () => {
            console.log('Fetching jobs...');
            const { data, error } = await supabaseAdmin
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching jobs:', error);
                throw error;
            }

            console.log('Jobs fetched:', data);
            return data as Job[];
        },
        staleTime: 5000, // Consider data stale after 5 seconds
        refetchOnWindowFocus: true,
    });

    const filteredJobs = jobs?.filter(job =>
        statusFilter === 'all' ? true : job.status === statusFilter
    );

    // Force refresh when form is successfully submitted
    const handleJobAdded = () => {
        console.log('Job added, refreshing list...');
        setRefreshTrigger(prev => prev + 1);
        refetch();
        setShowAddJob(false);
    };

    // Delete a job
    const handleDeleteJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this job? This cannot be undone.')) {
            return;
        }

        try {
            console.log('Deleting job:', jobId);
            const { error: deleteError } = await supabaseAdmin
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (deleteError) {
                console.error('Error deleting job:', deleteError);
                alert('Failed to delete job: ' + deleteError.message);
                return;
            }

            // Refresh the job list
            console.log('Job deleted successfully');
            refetch();
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
            const { error: updateError } = await supabaseAdmin
                .from('jobs')
                .update(updatedJob)
                .eq('id', editingJob.id);

            if (updateError) {
                console.error('Error updating job:', updateError);
                alert('Failed to update job: ' + updateError.message);
                return;
            }

            // Refresh the job list and exit edit mode
            console.log('Job updated successfully');
            setEditingJob(null);
            refetch();
        } catch (err) {
            console.error('Error updating job:', err);
            alert('Failed to update job');
        }
    };

    const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
        try {
            const { error } = await supabaseAdmin
                .from('jobs')
                .update({ status: newStatus })
                .eq('id', jobId);

            if (error) throw error;

            // Force refresh the jobs list
            refetch();
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

    if (isLoading) return <Box p={4}>Loading jobs...</Box>;
    if (error) return <Box p={4} color="error.main">Error loading jobs: {(error as Error).message}</Box>;

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Job Postings</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowAddJob(!showAddJob)}
                >
                    {showAddJob ? 'Close Form' : 'Add New Job'}
                </Button>
            </Box>

            {showAddJob && (
                <Box mb={4}>
                    <AddJobForm onSuccess={handleJobAdded} />
                </Box>
            )}

            <Box mb={3}>
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
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => refetch()}
                    sx={{ ml: 2 }}
                >
                    Refresh List
                </Button>
            </Box>

            {filteredJobs?.length === 0 ? (
                <Alert severity="info">No jobs found. Add a new job to get started.</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredJobs?.map(job => (
                        <Box key={job.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, p: 3, boxShadow: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="h5" fontWeight="600">{job.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Posted: {new Date(job.created_at).toLocaleDateString()}
                                    </Typography>
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

                            <Box mb={2}>
                                <Typography variant="subtitle1" fontWeight="600" mb={1}>Requirements:</Typography>
                                <Box component="ul" sx={{ paddingLeft: 2 }}>
                                    {job.requirements.map((req, index) => (
                                        <Box component="li" key={index}>
                                            <Typography variant="body2">{req}</Typography>
                                        </Box>
                                    ))}
                                </Box>
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
                        <Box component="form" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget as HTMLFormElement);
                            const updatedJob = {
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                status: formData.get('status') as Job['status'],
                                requirements: editingJob.requirements // Keep the same requirements for simplicity
                            };
                            handleSaveEdit(updatedJob);
                        }}>
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
                                label="Description"
                                defaultValue={editingJob.description}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                required
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