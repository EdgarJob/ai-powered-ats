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
    const [responsibilities, setResponsibilities] = useState('');
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

    // Initialize demo organization and user if needed
    const initDemoDataIfNeeded = async () => {
        try {
            // Check and set demo org ID
            let orgId = localStorage.getItem('demo_org_id');

            if (!orgId) {
                // Create a demo organization
                const demoOrgId = uuidv4();

                // Insert the organization
                const { error: orgError } = await supabaseAdmin
                    .from('organizations')
                    .insert([
                        {
                            id: demoOrgId,
                            name: 'Demo Organization'
                        }
                    ]);

                if (orgError) {
                    console.error('Error creating demo organization:', orgError);
                } else {
                    console.log('Demo organization created with ID:', demoOrgId);
                    localStorage.setItem('demo_org_id', demoOrgId);
                    orgId = demoOrgId;
                }
            }

            setOrganizationId(orgId);

            // Check and set demo user ID
            let userIdValue = localStorage.getItem('demo_user_id');

            if (!userIdValue) {
                // Create a demo user ID (not in auth table, just for reference)
                const demoUserId = uuidv4();
                localStorage.setItem('demo_user_id', demoUserId);
                userIdValue = demoUserId;
            }

            setUserId(userIdValue);

            return { orgId, userId: userIdValue };
        } catch (error) {
            console.error('Error initializing demo data:', error);
            return { orgId: null, userId: null };
        }
    };

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

    // Initialize database tables if needed
    useEffect(() => {
        const setupDatabase = async () => {
            try {
                // Add demo org/user if they don't exist
                await initDemoDataIfNeeded();

                // Check if the metadata column exists in the jobs table
                const { data: metadataCheck, error: metadataError } = await supabaseAdmin.rpc(
                    'check_column_exists',
                    { table_name: 'jobs', column_name: 'metadata' }
                ).single();

                // If the check failed, it might be because the function doesn't exist
                if (metadataError) {
                    console.log('Creating check_column_exists function...');
                    // Create the helper function to check if a column exists
                    await supabaseAdmin.rpc('create_column_check_function');
                }

                // Check again or for the first time
                const { data: columnExists } = await supabaseAdmin.rpc(
                    'check_column_exists',
                    { table_name: 'jobs', column_name: 'metadata' }
                ).single();

                if (!columnExists) {
                    console.log('Adding metadata column to jobs table...');

                    // Add a metadata JSONB column to store additional fields
                    try {
                        // Method 1: Using RPC
                        const { error: alterError } = await supabaseAdmin.rpc(
                            'execute_sql',
                            {
                                sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\''
                            }
                        );

                        if (alterError) {
                            console.error('Error adding metadata column via RPC:', alterError);

                            // Method 2: Direct SQL
                            try {
                                // Try a different approach with fetch API
                                const directResponse = await fetch(`${window.location.origin}/rest/v1/rpc/execute_sql`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`
                                    },
                                    body: JSON.stringify({
                                        sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\''
                                    })
                                });

                                if (!directResponse.ok) {
                                    console.error('Error adding metadata column via direct fetch:', await directResponse.text());
                                } else {
                                    console.log('Metadata column added successfully via direct fetch');
                                }
                            } catch (fetchError) {
                                console.error('Error with direct fetch to add metadata column:', fetchError);
                            }
                        } else {
                            console.log('Metadata column added successfully via RPC');
                        }
                    } catch (e) {
                        console.error('Exception when adding metadata column:', e);
                    }

                    // Verify if the column was added
                    try {
                        const { data: verifyExists } = await supabaseAdmin.rpc(
                            'check_column_exists',
                            { table_name: 'jobs', column_name: 'metadata' }
                        ).single();

                        if (verifyExists) {
                            console.log('Metadata column verified as existing after addition');
                        } else {
                            console.warn('Metadata column still not detected after addition attempts');
                        }
                    } catch (verifyError) {
                        console.error('Error verifying metadata column:', verifyError);
                    }
                } else {
                    console.log('Metadata column already exists');
                }

                // Also ensure the responsibilities column exists
                try {
                    const { data: respExists } = await supabaseAdmin.rpc(
                        'check_column_exists',
                        { table_name: 'jobs', column_name: 'responsibilities' }
                    ).single();

                    if (!respExists) {
                        console.log('Adding responsibilities column...');
                        await supabaseAdmin.rpc(
                            'execute_sql',
                            {
                                sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT'
                            }
                        );
                        console.log('Responsibilities column added');
                    } else {
                        console.log('Responsibilities column already exists');
                    }
                } catch (respError) {
                    console.error('Error checking/adding responsibilities column:', respError);
                }

                // All initialization done
                setIsInitializing(false);

            } catch (error) {
                console.error('Error setting up database:', error);
                // Set a timeout to retry initialization
                setTimeout(() => {
                    setupDatabase();
                }, 3000);
            }
        };

        setupDatabase();
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

            // Create a job object with a UUID
            const jobId = uuidv4();

            // Create metadata object
            const metadataObject = {
                industry,
                location,
                field,
                deadline,
            };

            // Store in localStorage for later use
            localStorage.setItem(`job_${jobId}_metadata`, JSON.stringify(metadataObject));

            // Log responsibilities value to check for any formatting issues
            console.log('Responsibilities to save:', responsibilities);
            console.log('Responsibilities type:', typeof responsibilities);
            console.log('Responsibilities length:', responsibilities ? responsibilities.length : 0);
            console.log('Metadata to save:', metadataObject);

            // Create job data with responsibilities directly and metadata
            const baseJobData = {
                id: jobId,
                title,
                description,
                requirements,
                status,
                created_by: userIdValue,
                org_id: orgId,
                responsibilities: responsibilities || undefined,
                metadata: JSON.stringify(metadataObject) // Include metadata in the database insert
            };

            console.log('Job data to insert:', baseJobData);

            // Try direct SQL insertion first as it's most reliable for schema issues
            try {
                const directInsertQuery = `
                    INSERT INTO jobs (
                        id, title, description, requirements, status, 
                        created_by, org_id, responsibilities, metadata
                    ) VALUES (
                        '${jobId}', 
                        '${title.replace(/'/g, "''")}', 
                        '${description.replace(/'/g, "''")}', 
                        '${JSON.stringify(requirements).replace(/'/g, "''")}', 
                        '${status}', 
                        '${userIdValue}', 
                        '${orgId}', 
                        ${responsibilities ? `'${responsibilities.replace(/'/g, "''")}'` : 'NULL'},
                        '${JSON.stringify(metadataObject).replace(/'/g, "''")}'
                    )
                    RETURNING *;
                `;

                console.log('Direct SQL insert query:', directInsertQuery);

                const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
                    'execute_sql',
                    { sql: directInsertQuery }
                );

                if (sqlError) {
                    console.error('Direct SQL insert failed:', sqlError);
                } else {
                    console.log('Direct SQL insert succeeded:', sqlData);
                    setSuccess('Job added successfully!');

                    // Reset form after success
                    resetForm();
                    onSuccess?.();
                    queryClient.invalidateQueries({ queryKey: ['jobs'] });
                    return; // Exit early on success
                }
            } catch (sqlErr) {
                console.error('Exception during direct SQL insert:', sqlErr);
            }

            // Fall back to standard insertion
            console.log('Falling back to standard insert approach...');

            // Insert the job with standard method
            let insertedJob;
            try {
                const { data: insertedData, error: insertError } = await supabaseAdmin
                    .from('jobs')
                    .insert([baseJobData])
                    .select();

                if (insertError) {
                    console.error('Error with insertion:', insertError);
                    throw new Error(insertError.message || 'Error adding job');
                }

                insertedJob = insertedData?.[0];
                console.log('Job added successfully:', insertedJob);
            } catch (insertErr) {
                console.error('Error inserting job:', insertErr);
                throw insertErr;
            }

            console.log('Job creation process complete');
            setSuccess('Job added successfully!');

            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            resetForm();
            onSuccess?.();
        } catch (err) {
            console.error('Error details:', err);

            // Show detailed error message
            const errorMessage = err instanceof Error
                ? `${err.name}: ${err.message}` + (err.stack ? `\nStack: ${err.stack}` : '')
                : 'Unknown error';
            setError('Failed to add job: ' + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to reset the form
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIndustry('');
        setLocation('');
        setField('');
        setResponsibilities('');
        setRequirements([]);
        setStatus('draft');
        setDeadline('');
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
                label="Description (Overview of the position)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required
                disabled={isInitializing}
                helperText="Provide a general overview of the position"
            />
            <TextField
                label="Responsibilities"
                value={responsibilities}
                onChange={e => setResponsibilities(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                disabled={isInitializing}
                helperText="List the key responsibilities of this position"
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
                    label="Add Required Skill"
                    value={requirementInput}
                    onChange={e => setRequirementInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    fullWidth
                    margin="normal"
                    disabled={isInitializing}
                    helperText="Add skills required for this position"
                />
                <Button
                    type="button"
                    onClick={handleAddRequirement}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={isInitializing}
                >
                    Add Skill
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