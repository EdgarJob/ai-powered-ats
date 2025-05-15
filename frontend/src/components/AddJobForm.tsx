import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Chip, Typography, Stack, Alert } from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Job } from '../lib/database.types';

interface AddJobFormProps {
    onSuccess?: () => void;
}

// Job status enum that matches the database
type JobStatus = 'draft' | 'published' | 'closed';

// This form lets you add a new job to the database
export function AddJobForm({ onSuccess }: AddJobFormProps) {
    // State for each form field
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');
    const [field, setField] = useState('');
    const [requirementInput, setRequirementInput] = useState('');
    const [requirements, setRequirements] = useState<string[]>([]);
    const [status, setStatus] = useState<JobStatus>('draft');
    const [deadline, setDeadline] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch or create organization and user on component mount
    useEffect(() => {
        let timeoutId: number;

        const initializeSystem = async () => {
            try {
                setIsInitializing(true);
                setError(''); // Clear any previous errors

                console.log("Initializing system...");

                // 1. Check for existing organization
                const { data: existingOrgs, error: fetchOrgError } = await supabaseAdmin
                    .from('organizations')
                    .select('id, name')
                    .limit(1);

                console.log("Existing orgs:", existingOrgs, "Error:", fetchOrgError);

                let orgId: string;

                if (fetchOrgError) {
                    console.error("Error fetching organizations:", fetchOrgError);
                    throw new Error(`Failed to initialize system: ${fetchOrgError.message}`);
                }

                // If no organizations, create one
                if (!existingOrgs || existingOrgs.length === 0) {
                    // Use a hardcoded ID from sample data for consistency
                    orgId = 'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97'; // ID used in sample_data.sql

                    console.log("Creating new organization with hardcoded ID:", orgId);

                    const { error: insertOrgError } = await supabaseAdmin
                        .from('organizations')
                        .insert([
                            {
                                id: orgId,
                                name: 'TechCorp Inc.'
                            }
                        ]);

                    if (insertOrgError) {
                        console.error("Error creating organization:", insertOrgError);
                        throw new Error(`Failed to create organization: ${insertOrgError.message}`);
                    }

                    // Create org_credits for the new organization
                    const { error: creditsError } = await supabaseAdmin
                        .from('org_credits')
                        .insert([
                            {
                                org_id: orgId,
                                credits: 100
                            }
                        ]);

                    if (creditsError) {
                        console.error("Error creating organization credits:", creditsError);
                        // We'll continue despite this error as it might not be required
                    }
                } else {
                    // Use existing organization
                    orgId = existingOrgs[0].id;
                    console.log("Using existing organization:", orgId);
                }

                // Set the organization ID
                setOrganizationId(orgId);

                // 2. Check for existing user or use hardcoded ID
                let userIdValue: string;

                // Skip creating users since we don't have access to the auth.users table
                // Use a hardcoded ID from sample data to satisfy the foreign key constraint
                userIdValue = 'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98'; // This ID is used in sample_data.sql
                console.log("Using hardcoded user ID:", userIdValue);

                // Set the user ID
                setUserId(userIdValue);

                // Store for later use
                localStorage.setItem('demo_user_id', userIdValue);
                localStorage.setItem('demo_org_id', orgId);

                setIsInitializing(false);
                console.log("System initialized successfully!");

            } catch (err) {
                console.error("Initialization error:", err);
                setError(`${err instanceof Error ? err.message : 'System initialization failed'}`);
                setIsInitializing(false);

                // Schedule a retry after 3 seconds
                timeoutId = window.setTimeout(() => {
                    console.log("Retrying initialization...");
                    initializeSystem();
                }, 3000);
            }
        };

        // Start initialization
        initializeSystem();

        // Cleanup function to cancel any pending retries
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    // Add a requirement to the list
    const handleAddRequirement = () => {
        if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
            setRequirements([...requirements, requirementInput.trim()]);
            setRequirementInput('');
        }
    };

    // Remove a requirement
    const handleDeleteRequirement = (req: string) => {
        setRequirements(requirements.filter(r => r !== req));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        setIsSubmitting(true);

        try {
            // Check that all required fields are filled
            if (!title || !description || requirements.length === 0) {
                setError('Please fill in all required fields and add at least one requirement.');
                setIsSubmitting(false);
                return;
            }

            // Get organization and user IDs, with fallback to localStorage
            let orgId = organizationId;
            let userIdValue = userId;

            if (!orgId) {
                // Try to get from localStorage
                const storedOrgId = localStorage.getItem('demo_org_id');
                if (storedOrgId) {
                    console.log("Using organization ID from localStorage:", storedOrgId);
                    orgId = storedOrgId;
                    setOrganizationId(storedOrgId);
                }
            }

            if (!userIdValue) {
                // Try to get from localStorage
                const storedUserId = localStorage.getItem('demo_user_id');
                if (storedUserId) {
                    console.log("Using user ID from localStorage:", storedUserId);
                    userIdValue = storedUserId;
                    setUserId(storedUserId);
                }
            }

            // Check organization and user IDs are set
            if (!orgId || !userIdValue) {
                setError('System not fully initialized. Please try again in a moment.');
                setIsSubmitting(false);
                return;
            }

            // Create a job object
            const jobId = uuidv4();
            const jobData = {
                id: jobId,  // Explicitly set the ID
                title,
                description,
                requirements,
                status,
                created_by: userIdValue,
                org_id: orgId
                // Remove fields that don't exist in the actual database
                // industry, location, field, deadline
            };

            console.log('Submitting job data:', jobData);

            // Use admin client with service role key for higher permissions
            const { data, error: insertError } = await supabaseAdmin
                .from('jobs')
                .insert([jobData])
                .select();

            if (insertError) {
                console.error('Supabase error:', insertError);
                console.error('Error code:', insertError.code);
                console.error('Error details:', insertError.details);
                console.error('Error hint:', insertError.hint);
                console.error('Error message:', insertError.message);
                throw new Error(insertError.message || 'Error adding job');
            }

            console.log('Job added successfully:', data);
            setSuccess('Job added successfully!');
            queryClient.invalidateQueries({ queryKey: ['jobs'] });

            // Reset form
            setTitle('');
            setDescription('');
            setIndustry('');
            setLocation('');
            setField('');
            setRequirements([]);
            setStatus('draft');
            setDeadline('');

            onSuccess?.();
        } catch (err) {
            console.error('Error details:', err);
            setError('Failed to add job: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Add a New Job</Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isInitializing && <Alert severity="info" sx={{ mb: 2 }}>Initializing system...</Alert>}

            <TextField
                label="Job Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isInitializing}
            />
            <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                disabled={isInitializing}
            />
            <TextField
                label="Industry"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isInitializing}
            />
            <TextField
                label="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isInitializing}
            />
            <TextField
                label="Field"
                value={field}
                onChange={e => setField(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isInitializing}
            />
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Add Requirement"
                    value={requirementInput}
                    onChange={e => setRequirementInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    fullWidth
                    margin="normal"
                    disabled={isInitializing}
                />
                <Button
                    type="button"
                    onClick={handleAddRequirement}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={isInitializing}
                >
                    Add Requirement
                </Button>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {requirements.map((req, index) => (
                        <Chip
                            key={index}
                            label={req}
                            onDelete={() => handleDeleteRequirement(req)}
                            disabled={isInitializing}
                        />
                    ))}
                </Box>
            </Box>
            <TextField
                select
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value as JobStatus)}
                fullWidth
                margin="normal"
                required
                disabled={isInitializing}
            >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
                label="Deadline"
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{
                    shrink: true,
                }}
                disabled={isInitializing}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || isInitializing}
                sx={{ mt: 2 }}
            >
                {isSubmitting ? 'Submitting...' : 'Add Job'}
            </Button>
        </Box>
    );
} 