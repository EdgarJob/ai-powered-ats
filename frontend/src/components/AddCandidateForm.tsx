import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Insert'];

interface Job {
    id: string;
    title: string;
}

// Helper function for email validation
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// This form lets you add a new candidate to the database
export function AddCandidateForm(): React.ReactElement {
    // State for each form field
    const [jobId, setJobId] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [status, setStatus] = useState<'pending' | 'reviewed' | 'shortlisted' | 'rejected'>('pending');
    const queryClient = useQueryClient();

    // Fetch jobs for the dropdown
    const { data: jobs, isLoading: jobsLoading, error: jobsError } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('id, title')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) throw new Error('No jobs found');

            return data;
        }
    });

    // Mutation for adding a candidate
    const { mutate: addCandidate, isPending, error: mutationError } = useMutation({
        mutationFn: async (candidate: Candidate) => {
            const { data, error } = await supabase
                .from('candidates')
                .insert([candidate])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Reset form
            setJobId('');
            setFullName('');
            setEmail('');
            setPhone('');
            setResumeUrl('');
            setStatus('pending');

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
        }
    });

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!jobId || !fullName || !email || !resumeUrl) {
            return;
        }

        if (!isValidEmail(email)) {
            return;
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        addCandidate({
            id,
            job_id: jobId,
            full_name: fullName,
            email,
            phone,
            resume_url: resumeUrl,
            status,
            created_at: now,
            updated_at: now
        });
    };

    // Show error if jobs failed to load
    if (jobsError) {
        return (
            <Alert severity="error">
                {handleSupabaseError(jobsError)}
            </Alert>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Add a New Candidate</Typography>

            {/* Success message */}
            {!isPending && !mutationError && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Candidate added successfully!
                </Alert>
            )}

            {/* Error message */}
            {mutationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {handleSupabaseError(mutationError)}
                </Alert>
            )}

            <TextField
                select
                label="Job"
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={jobsLoading || isPending}
                error={!jobId}
                helperText={jobsLoading ? 'Loading jobs...' : !jobId ? 'Please select a job' : ''}
            >
                {jobs?.map((job: Job) => (
                    <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
                ))}
            </TextField>

            <TextField
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isPending}
                error={!fullName}
                helperText={!fullName ? 'Please enter full name' : ''}
            />

            <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
                type="email"
                disabled={isPending}
                error={!email || !isValidEmail(email)}
                helperText={!email ? 'Please enter email' : !isValidEmail(email) ? 'Please enter a valid email' : ''}
            />

            <TextField
                label="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isPending}
            />

            <TextField
                label="Resume URL"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isPending}
                error={!resumeUrl}
                helperText={!resumeUrl ? 'Please enter resume URL' : ''}
            />

            <TextField
                select
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value as 'pending' | 'reviewed' | 'shortlisted' | 'rejected')}
                fullWidth
                margin="normal"
                disabled={isPending}
            >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="shortlisted">Shortlisted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={isPending || !jobId || !fullName || !email || !resumeUrl || !isValidEmail(email)}
            >
                {isPending ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} color="inherit" />
                        <span>Adding Candidate...</span>
                    </Stack>
                ) : (
                    'Add Candidate'
                )}
            </Button>
        </Box>
    );
} 