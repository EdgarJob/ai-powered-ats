import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Stack, Alert, CircularProgress, Select, FormControl, InputLabel, Grid, Card, CardContent, CardActions } from '@mui/material';
import { supabase, handleSupabaseError } from '../lib/supabase';
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

    // Fetch available jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'Open');

                if (error) throw error;
                setJobs(data || []);
                setFilteredJobs(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = jobs;

        if (filters.industry) {
            result = result.filter(job => job.industry === filters.industry);
        }
        if (filters.location) {
            result = result.filter(job => job.location === filters.location);
        }
        if (filters.field) {
            result = result.filter(job => job.field === filters.field);
        }

        setFilteredJobs(result);
    }, [filters, jobs]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <Box p={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>Error: {error}</Alert>;

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" mb={3} fontWeight="bold">Available Positions</Typography>

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
                            {[...new Set(jobs.map(job => job.industry))].map(industry => (
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
                            {[...new Set(jobs.map(job => job.location))].map(location => (
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
                            {[...new Set(jobs.map(job => job.field))].map(field => (
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
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Industry: {job.industry}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Location: {job.location}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Field: {job.field}</Typography>
                                </Grid>
                            </Grid>
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
        </Box>
    );
}; 