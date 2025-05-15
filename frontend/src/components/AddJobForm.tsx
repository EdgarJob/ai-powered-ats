import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Chip, Typography, Stack, Alert } from '@mui/material';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

// This form lets you add a new job to the database
export function AddJobForm() {
    // State for each form field
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirementInput, setRequirementInput] = useState('');
    const [requirements, setRequirements] = useState<string[]>([]);
    const [status, setStatus] = useState<'draft' | 'published' | 'closed'>('draft');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

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
        if (!title || !description || requirements.length === 0) {
            setError('Please fill in all fields and add at least one requirement.');
            return;
        }
        // Example org_id and created_by (replace with real values in production)
        const org_id = 'd9d53a82-7ae9-4c0f-8f49-6f4a74d6ca97';
        const created_by = 'e9d53a82-7ae9-4c0f-8f49-6f4a74d6ca98';
        const id = uuidv4();
        const now = new Date().toISOString();
        const { error: insertError } = await supabase.from('jobs').insert([
            {
                id,
                org_id,
                title,
                description,
                requirements,
                status,
                created_by,
                created_at: now,
                updated_at: now,
            },
        ]);
        if (insertError) {
            setError('Failed to add job: ' + insertError.message);
        } else {
            setSuccess('Job added successfully!');
            setTitle('');
            setDescription('');
            setRequirements([]);
            setStatus('draft');
            queryClient.invalidateQueries(['jobs']); // Refresh job list
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Add a New Job</Typography>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Job Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                minRows={3}
                required
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, mb: 1 }}>
                <TextField
                    label="Add Requirement"
                    value={requirementInput}
                    onChange={e => setRequirementInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequirement(); } }}
                />
                <Button variant="outlined" onClick={handleAddRequirement}>Add</Button>
            </Stack>
            <Box sx={{ mb: 2 }}>
                {requirements.map(req => (
                    <Chip key={req} label={req} onDelete={() => handleDeleteRequirement(req)} sx={{ mr: 1, mb: 1 }} />
                ))}
            </Box>
            <TextField
                select
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                fullWidth
                margin="normal"
            >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Add Job</Button>
        </Box>
    );
} 