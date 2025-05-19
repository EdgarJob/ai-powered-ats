import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../lib/AuthContext';

// Component for applying to a specific job
export const JobApplication = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Step management
    const [activeStep, setActiveStep] = useState(0);

    // State variables
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [candidate, setCandidate] = useState<any>(null);
    const [applicationNote, setApplicationNote] = useState('');

    // Profile editing fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileUpdated, setProfileUpdated] = useState(false);

    // Fetch job details and candidate information
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check if user is authenticated
                if (!user || !user.email) {
                    throw new Error('You must be logged in to apply for a job');
                }

                // Fetch job details
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', jobId)
                    .single();

                if (jobError) throw jobError;
                if (!jobData) throw new Error('Job not found');

                setJob(jobData);

                // Fetch candidate information based on email
                const { data: candidateData, error: candidateError } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (candidateError) {
                    if (candidateError.code === 'PGRST116') {
                        // No candidate profile found, redirect to registration
                        navigate('/register', { state: { returnTo: `/apply/${jobId}` } });
                        return;
                    }
                    throw candidateError;
                }

                if (candidateData) {
                    setCandidate(candidateData);

                    // Initialize profile fields
                    setFirstName(candidateData.first_name || '');
                    setLastName(candidateData.last_name || '');
                    setPhone(candidateData.phone || '');
                    setLocation(candidateData.location || '');
                    setBio(candidateData.bio || '');

                    // Check if already applied
                    const { data: existingApplication, error: applicationError } = await supabase
                        .from('job_applications')
                        .select('*')
                        .eq('candidate_id', candidateData.id)
                        .eq('job_id', jobId)
                        .single();

                    if (!applicationError && existingApplication) {
                        setError('You have already applied for this job.');
                    }
                } else {
                    // No candidate profile found, redirect to registration
                    navigate('/register', { state: { returnTo: `/apply/${jobId}` } });
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load application data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId, user, navigate]);

    // Handle profile update
    const handleProfileUpdate = async () => {
        if (!candidate) return;

        try {
            setEditingProfile(true);

            const updatedData = {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                location: location,
                bio: bio,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('candidates')
                .update(updatedData)
                .eq('id', candidate.id);

            if (error) throw error;

            // Update local state
            setCandidate({
                ...candidate,
                ...updatedData
            });

            setProfileUpdated(true);
            setActiveStep(1); // Move to next step

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setEditingProfile(false);
        }
    };

    // Submit application
    const handleSubmit = async () => {
        if (!candidate || !job) return;

        try {
            setSubmitting(true);
            setError(null);

            // Create job application record
            const applicationData = {
                id: uuidv4(),
                candidate_id: candidate.id,
                job_id: jobId,
                status: 'pending',
                notes: applicationNote,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('job_applications')
                .insert([applicationData]);

            if (insertError) throw insertError;

            setSuccess(true);
            setActiveStep(2); // Move to final step

            // Redirect to home after a delay
            setTimeout(() => {
                navigate('/');
            }, 5000);

        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle next step
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    // Handle previous step
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                    Back to Jobs
                </Button>
            </Box>
        );
    }

    if (!job) {
        return (
            <Box p={3}>
                <Alert severity="error">Job not found</Alert>
                <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Back to Jobs
                </Button>
            </Box>
        );
    }

    // Format job metadata for display
    const formatJobMetadata = () => {
        let metadata = {};
        try {
            if (typeof job.metadata === 'string') {
                metadata = JSON.parse(job.metadata);
            } else if (typeof job.metadata === 'object') {
                metadata = job.metadata;
            }
        } catch (e) {
            console.error('Error parsing job metadata', e);
        }
        return metadata;
    };

    const jobMetadata = formatJobMetadata();

    // Parse responsibilities for display
    const formatResponsibilities = () => {
        if (job.responsibilities) return job.responsibilities;
        if (jobMetadata.responsibilities) return jobMetadata.responsibilities;
        return 'No responsibilities specified.';
    };

    const steps = ['Review Profile', 'Application Details', 'Confirmation'];

    // Render stepper content
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Your Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Please review your profile information before applying. This information will be sent to the employer.
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    disabled={editingProfile}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    disabled={editingProfile}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={candidate?.email || ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={editingProfile}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                    disabled={editingProfile}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    disabled={editingProfile}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleProfileUpdate}
                                disabled={editingProfile}
                            >
                                {editingProfile ? <CircularProgress size={24} /> : 'Save & Continue'}
                            </Button>
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Application Details
                        </Typography>

                        <Box sx={{ mt: 3 }}>
                            <TextField
                                fullWidth
                                label="Application Note (Optional)"
                                multiline
                                rows={4}
                                value={applicationNote}
                                onChange={(e) => setApplicationNote(e.target.value)}
                                placeholder="Add any additional information you'd like the employer to know..."
                                disabled={submitting}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
                            </Button>
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Your application has been submitted successfully!
                        </Alert>
                        <Typography variant="body1" paragraph>
                            You will be redirected to the job listings page in a few seconds.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/')}
                        >
                            Return to Job Listings
                        </Button>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {job.title}
                </Typography>

                {profileUpdated && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Your profile has been updated successfully.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Job Description</Typography>
                        <Typography variant="body1" paragraph>
                            {job.description}
                        </Typography>

                        <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {formatResponsibilities()}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Requirements</Typography>
                        <Box component="ul" sx={{ pl: 4 }}>
                            {job.requirements && job.requirements.map((req: string, index: number) => (
                                <Typography component="li" key={index} variant="body1">
                                    {req}
                                </Typography>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Job Details</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Industry:
                                    </Typography>
                                    <Typography variant="body1">
                                        {job.industry || jobMetadata.industry || 'Not specified'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Location:
                                    </Typography>
                                    <Typography variant="body1">
                                        {job.location || jobMetadata.location || 'Not specified'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Field:
                                    </Typography>
                                    <Typography variant="body1">
                                        {job.field || jobMetadata.field || 'Not specified'}
                                    </Typography>
                                </Box>
                                {(job.deadline || jobMetadata.deadline) && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Application Deadline:
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(job.deadline || jobMetadata.deadline).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Apply for this Position</Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {getStepContent(activeStep)}
            </Paper>
        </Box>
    );
}; 