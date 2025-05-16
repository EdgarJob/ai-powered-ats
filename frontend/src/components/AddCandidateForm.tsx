import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Stack, Alert, CircularProgress, Select, FormControl, InputLabel, Grid, Card, CardContent, CardActions, SelectChangeEvent, Divider } from '@mui/material';
import { supabase, handleSupabaseError, supabaseAdmin } from '../lib/supabase';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Database, Job } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Insert'];

interface JobFilters {
    industry: string;
    location: string;
    field: string;
}

// Helper function for email validation
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to get property from either direct or metadata
const getJobProperty = (job: Job, property: string): string | null => {
    // Check direct property
    if (job[property as keyof Job]) return job[property as keyof Job] as string;

    // Check metadata
    try {
        if (job.metadata) {
            const metadata = typeof job.metadata === 'string'
                ? JSON.parse(job.metadata)
                : job.metadata;

            return metadata[property] || null;
        }
    } catch (e) {
        console.error(`Error parsing metadata for ${property}`, e);
    }

    return null;
};

// This form lets you add a new candidate to the database
export const JobApplicationForm = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filters, setFilters] = useState<JobFilters>({
        industry: '',
        location: '',
        field: ''
    });
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>("");
    const [showDebug, setShowDebug] = useState(false);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [updateStatus, setUpdateStatus] = useState("");
    const [filterOptions, setFilterOptions] = useState<{ industries: string[]; locations: string[]; fields: string[] }>({
        industries: [],
        locations: [],
        fields: []
    });

    // Fetch available jobs
    const fetchJobs = async () => {
        try {
            console.log('Fetching all jobs...');
            setLoading(true);

            // Try to use admin client for better permissions
            const { data, error } = await supabaseAdmin
                .from('jobs')
                .select('*');

            console.log('All jobs from database:', data);
            console.log('Query error:', error);

            // Add this to check if there are any published jobs
            if (data && data.length > 0) {
                setAllJobs(data);
                const publishedJobs = data.filter(job => job.status === 'published');
                console.log('Published jobs found:', publishedJobs.length);
                console.log('Jobs with other statuses:', data.length - publishedJobs.length);

                // Log each job status to see what's actually in the database
                data.forEach(job => {
                    console.log(`Job ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`);
                });

                setDebugInfo(`Found ${data.length} total jobs, ${publishedJobs.length} published`);

                // Now filter for published only
                const filteredData = data.filter(job => job.status && job.status.toLowerCase() === 'published');
                console.log('Jobs after case-insensitive filter:', filteredData);

                // Set the filtered jobs
                setJobs(filteredData || []);
                setFilteredJobs(filteredData || []);
            } else {
                setDebugInfo("No jobs found in database");
                setAllJobs([]);
                setJobs([]);
                setFilteredJobs([]);
            }
        } catch (err) {
            console.error('Error in jobs fetch:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
            setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Handle updating a job status
    const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
        try {
            setUpdateStatus("Updating job status...");
            console.log(`Updating job ${jobId} to status: ${newStatus}`);

            const { error } = await supabaseAdmin
                .from('jobs')
                .update({ status: newStatus })
                .eq('id', jobId);

            if (error) {
                console.error('Error updating job status:', error);
                setUpdateStatus(`Error: ${error.message}`);
                return;
            }

            setUpdateStatus("Job status updated successfully!");
            // Refresh the job list
            await fetchJobs();
        } catch (err) {
            console.error('Error updating job:', err);
            setUpdateStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Apply filters
    useEffect(() => {
        let result = jobs;

        if (filters.industry) {
            result = result.filter(job => {
                // Check direct property
                if (job.industry === filters.industry) return true;

                // Check metadata
                try {
                    if (job.metadata) {
                        const metadata = typeof job.metadata === 'string'
                            ? JSON.parse(job.metadata)
                            : job.metadata;
                        return metadata.industry === filters.industry;
                    }
                } catch (e) {
                    console.error("Error parsing metadata for filtering", e);
                }
                return false;
            });
        }

        if (filters.location) {
            result = result.filter(job => {
                // Check direct property
                if (job.location === filters.location) return true;

                // Check metadata
                try {
                    if (job.metadata) {
                        const metadata = typeof job.metadata === 'string'
                            ? JSON.parse(job.metadata)
                            : job.metadata;
                        return metadata.location === filters.location;
                    }
                } catch (e) {
                    console.error("Error parsing metadata for filtering", e);
                }
                return false;
            });
        }

        if (filters.field) {
            result = result.filter(job => {
                // Check direct property
                if (job.field === filters.field) return true;

                // Check metadata
                try {
                    if (job.metadata) {
                        const metadata = typeof job.metadata === 'string'
                            ? JSON.parse(job.metadata)
                            : job.metadata;
                        return metadata.field === filters.field;
                    }
                } catch (e) {
                    console.error("Error parsing metadata for filtering", e);
                }
                return false;
            });
        }

        setFilteredJobs(result);
    }, [filters, jobs]);

    // Handle filter changes from Select components
    const handleFilterChange = (event: SelectChangeEvent) => {
        const name = event.target.name as keyof JobFilters;
        const value = event.target.value;

        if (name) {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Debug panel component
    const DebugPanel = () => (
        <Card sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6">Debug Information</Typography>
            <Typography variant="body2" mb={2}>Debug info: {debugInfo}</Typography>

            {updateStatus && (
                <Alert severity="info" sx={{ mb: 2 }}>{updateStatus}</Alert>
            )}

            <Typography variant="subtitle1" mt={2}>All Jobs ({allJobs.length}):</Typography>
            {allJobs.map(job => (
                <Box key={job.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body1">{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        ID: {job.id} | Status: {job.status || 'undefined'}
                    </Typography>
                    <Box mt={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleUpdateJobStatus(job.id, 'published')}
                            sx={{ mr: 1 }}
                        >
                            Set Published
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleUpdateJobStatus(job.id, 'draft')}
                        >
                            Set Draft
                        </Button>
                    </Box>
                </Box>
            ))}

            <Button variant="contained" color="primary" onClick={fetchJobs} sx={{ mt: 2 }}>
                Refresh Jobs
            </Button>
        </Card>
    );

    // Fix the filter creation section by extracting values from both direct properties and metadata
    useEffect(() => {
        // Get unique filter values from all jobs (including the ones stored in metadata)
        const extractValues = () => {
            // Create sets to store unique values
            const industries = new Set<string>();
            const locations = new Set<string>();
            const fields = new Set<string>();

            // Extract values from all jobs
            allJobs.forEach(job => {
                // Check direct properties first
                if (job.industry) industries.add(job.industry);
                if (job.location) locations.add(job.location);
                if (job.field) fields.add(job.field);

                // Then check metadata (might be stored there for older jobs)
                try {
                    if (job.metadata) {
                        const metadata = typeof job.metadata === 'string'
                            ? JSON.parse(job.metadata)
                            : job.metadata;

                        if (metadata.industry) industries.add(metadata.industry);
                        if (metadata.location) locations.add(metadata.location);
                        if (metadata.field) fields.add(metadata.field);
                    }
                } catch (e) {
                    console.error("Error parsing metadata for job", job.id, e);
                }
            });

            console.log("Extracted filter values:", {
                industries: Array.from(industries),
                locations: Array.from(locations),
                fields: Array.from(fields)
            });

            return {
                industries: Array.from(industries),
                locations: Array.from(locations),
                fields: Array.from(fields)
            };
        };

        // Store the extracted values
        const { industries, locations, fields } = extractValues();

        // Update state to store these values for the filters
        setFilterOptions({
            industries,
            locations,
            fields
        });
    }, [allJobs]);

    if (loading) return <Box p={4}><CircularProgress /></Box>;
    if (error) return (
        <Box p={4}>
            <Alert severity="error">Error: {error}</Alert>
            <Typography variant="body2" mt={2} color="text.secondary">Debug info: {debugInfo}</Typography>
            <Button variant="outlined" color="primary" onClick={() => setShowDebug(!showDebug)} sx={{ mt: 2 }}>
                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
            {showDebug && <DebugPanel />}
        </Box>
    );

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" mb={3} fontWeight="bold">Available Positions</Typography>
            <Typography variant="body2" mb={2} color="text.secondary">Found {filteredJobs.length} position(s)</Typography>

            <Button variant="outlined" color="primary" onClick={() => setShowDebug(!showDebug)} sx={{ mb: 2 }}>
                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>

            {showDebug && <DebugPanel />}

            {filteredJobs.length === 0 ? (
                <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No published job positions are currently available. Please check back later.
                    </Alert>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            While waiting for new opportunities, you can register as a candidate in our system.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            component="a"
                            href="/register"
                        >
                            Register as a Candidate
                        </Button>
                    </Box>
                </Box>
            ) : (
                <>
                    {/* Filters */}
                    <Grid container spacing={2} mb={4}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="industry-filter-label">Industry</InputLabel>
                                <Select
                                    labelId="industry-filter-label"
                                    name="industry"
                                    value={filters.industry}
                                    label="Industry"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All Industries</MenuItem>
                                    {filterOptions.industries.map(industry => (
                                        <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="location-filter-label">Location</InputLabel>
                                <Select
                                    labelId="location-filter-label"
                                    name="location"
                                    value={filters.location}
                                    label="Location"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All Locations</MenuItem>
                                    {filterOptions.locations.map(location => (
                                        <MenuItem key={location} value={location}>{location}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="field-filter-label">Field</InputLabel>
                                <Select
                                    labelId="field-filter-label"
                                    name="field"
                                    value={filters.field}
                                    label="Field"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All Fields</MenuItem>
                                    {filterOptions.fields.map(field => (
                                        <MenuItem key={field} value={field}>{field}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Job Listings */}
                    <Stack spacing={3}>
                        {filteredJobs.map(job => (
                            <Card key={job.id} sx={{ boxShadow: 2, borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h5" fontWeight="600" gutterBottom>{job.title}</Typography>
                                    <Typography variant="body1" paragraph>{job.description}</Typography>

                                    {job.responsibilities && (
                                        <Box mb={2}>
                                            <Typography variant="subtitle1" fontWeight="600" mb={1}>Responsibilities:</Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                {job.responsibilities}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Job Properties Section */}
                                    <Grid container spacing={2} mb={2}>
                                        {/* Industry */}
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Industry:</strong> {getJobProperty(job, 'industry') || 'Not specified'}
                                            </Typography>
                                        </Grid>

                                        {/* Location */}
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Location:</strong> {getJobProperty(job, 'location') || 'Not specified'}
                                            </Typography>
                                        </Grid>

                                        {/* Field */}
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Field:</strong> {getJobProperty(job, 'field') || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {job.deadline && (
                                        <Typography variant="body2" color="error.main" mb={2}>
                                            <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => window.location.href = `/apply/${job.id}`}
                                    >
                                        Apply Now
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Stack>
                </>
            )}
        </Box>
    );
}; 