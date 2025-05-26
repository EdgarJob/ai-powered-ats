import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { createJob, type Job } from '../lib/job-service';

interface AddJobFormProps {
    open: boolean;
    onClose: () => void;
    onJobAdded: (job: Job) => void;
}

export function AddJobForm({ open, onClose, onJobAdded }: AddJobFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        employmentType: 'Full-time',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD'
    });
    const [requirements, setRequirements] = useState<string[]>([]);
    const [responsibilities, setResponsibilities] = useState<string[]>([]);
    const [currentRequirement, setCurrentRequirement] = useState('');
    const [currentResponsibility, setCurrentResponsibility] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addRequirement = () => {
        if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
            setRequirements(prev => [...prev, currentRequirement.trim()]);
            setCurrentRequirement('');
        }
    };

    const removeRequirement = (requirement: string) => {
        setRequirements(prev => prev.filter(req => req !== requirement));
    };

    const addResponsibility = () => {
        if (currentResponsibility.trim() && !responsibilities.includes(currentResponsibility.trim())) {
            setResponsibilities(prev => [...prev, currentResponsibility.trim()]);
            setCurrentResponsibility('');
        }
    };

    const removeResponsibility = (responsibility: string) => {
        setResponsibilities(prev => prev.filter(resp => resp !== responsibility));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const jobData = {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                description: formData.description,
                employmentType: formData.employmentType as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
                requirements,
                responsibilities,
                salary: formData.salaryMin || formData.salaryMax ? {
                    min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
                    max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
                    currency: formData.salaryCurrency
                } : undefined,
                status: 'published' as const
            };

            const newJob = await createJob(jobData);
            onJobAdded(newJob);
            handleClose();
        } catch (error) {
            console.error('Error creating job:', error);
            setError(error instanceof Error ? error.message : 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            description: '',
            employmentType: 'Full-time',
            salaryMin: '',
            salaryMax: '',
            salaryCurrency: 'USD'
        });
        setRequirements([]);
        setResponsibilities([]);
        setCurrentRequirement('');
        setCurrentResponsibility('');
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Add New Job</Typography>
                    <Button onClick={handleClose} size="small">
                        <Close />
                    </Button>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Basic Information */}
                        <TextField
                            label="Job Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            required
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Employment Type</InputLabel>
                            <Select
                                value={formData.employmentType}
                                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                                label="Employment Type"
                            >
                                <MenuItem value="Full-time">Full-time</MenuItem>
                                <MenuItem value="Part-time">Part-time</MenuItem>
                                <MenuItem value="Contract">Contract</MenuItem>
                                <MenuItem value="Remote">Remote</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Job Description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            required
                            fullWidth
                            multiline
                            rows={4}
                        />

                        {/* Salary Information */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>Salary Range (Optional)</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Minimum Salary"
                                type="number"
                                value={formData.salaryMin}
                                onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Maximum Salary"
                                type="number"
                                value={formData.salaryMax}
                                onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                                fullWidth
                            />
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    value={formData.salaryCurrency}
                                    onChange={(e) => handleInputChange('salaryCurrency', e.target.value)}
                                    label="Currency"
                                >
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="GBP">GBP</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Requirements */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>Requirements</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                label="Add requirement"
                                value={currentRequirement}
                                onChange={(e) => setCurrentRequirement(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                fullWidth
                                size="small"
                            />
                            <Button onClick={addRequirement} variant="outlined" startIcon={<Add />}>
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {requirements.map((req, index) => (
                                <Chip
                                    key={index}
                                    label={req}
                                    onDelete={() => removeRequirement(req)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>

                        {/* Responsibilities */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>Responsibilities</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                label="Add responsibility"
                                value={currentResponsibility}
                                onChange={(e) => setCurrentResponsibility(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                                fullWidth
                                size="small"
                            />
                            <Button onClick={addResponsibility} variant="outlined" startIcon={<Add />}>
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {responsibilities.map((resp, index) => (
                                <Chip
                                    key={index}
                                    label={resp}
                                    onDelete={() => removeResponsibility(resp)}
                                    color="secondary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.title || !formData.company || !formData.location}
                        startIcon={loading ? <CircularProgress size={20} /> : undefined}
                    >
                        {loading ? 'Creating...' : 'Create Job'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
} 