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
    Radio
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Component for applying to a specific job
export const JobApplicationForm = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    // State variables
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [candidate, setCandidate] = useState<any>(null);
    const [resumeVersions, setResumeVersions] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [applicationNote, setApplicationNote] = useState('');

    // Fetch job details and candidate information
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check if user is authenticated
                const { data: { user } } = await supabase.auth.getUser();

                if (!user || !user.email) {
                    throw new Error('You must be logged in to apply for a job');
                }

                setUserEmail(user.email);

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

                if (candidateError && candidateError.code !== 'PGRST116') {
                    // PGRST116 is "no rows returned" which is fine - user may not have registered yet
                    throw candidateError;
                }

                if (candidateData) {
                    setCandidate(candidateData);

                    // Fetch candidate's resume versions
                    const { data: resumeData, error: resumeError } = await supabase
                        .from('candidate_resumes')
                        .select('*')
                        .eq('candidate_id', candidateData.id);

                    if (resumeError) throw resumeError;

                    setResumeVersions(resumeData || []);

                    // Set default resume if available
                    if (resumeData && resumeData.length > 0) {
                        const defaultResume = resumeData.find(r => r.is_default) || resumeData[0];
                        setSelectedResumeId(defaultResume.id);
                    }

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
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load application data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    // Submit application
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!candidate) {
            // Redirect to registration page
            navigate('/register', { state: { returnTo: `/apply/${jobId}` } });
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Create job application record
            const applicationData = {
                id: uuidv4(),
                candidate_id: candidate.id,
                job_id: jobId,
                resume_version_id: selectedResumeId || null,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('job_applications')
                .insert([applicationData]);

            if (insertError) throw insertError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
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

    if (success) {
        return (
            <Box p={3}>
                <Alert severity="success">
                    Application submitted successfully! You will be redirected shortly.
                </Alert>
            </Box>
        );
    }

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" mb={3}>Apply for: {job.title}</Typography>

            {!candidate ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>You need to register first</Typography>
                    <Typography variant="body1" paragraph>
                        Before applying for this position, you need to create a candidate profile.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/register', { state: { returnTo: `/apply/${jobId}` } })}
                    >
                        Register Now
                    </Button>
                </Paper>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Job Details</Typography>
                        <Typography variant="body1" fontWeight="bold">{job.title}</Typography>
                        <Typography variant="body2" paragraph>{job.description}</Typography>

                        {job.responsibilities && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold">Responsibilities:</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {job.responsibilities}
                                </Typography>
                            </Box>
                        )}

                        {job.requirements && (
                            <Box mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold">Requirements:</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {job.requirements}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Your Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">
                                    <strong>Name:</strong> {candidate.first_name} {candidate.last_name}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2">
                                    <strong>Email:</strong> {candidate.email}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {resumeVersions.length > 0 ? (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Select Resume Version</Typography>
                            <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                                Choose which version of your resume to use for this application.
                            </Typography>

                            <RadioGroup
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                            >
                                {resumeVersions.map(resume => (
                                    <Card key={resume.id} sx={{ mb: 2, border: resume.id === selectedResumeId ? '2px solid #0071e3' : '1px solid #eee' }}>
                                        <CardContent>
                                            <FormControlLabel
                                                value={resume.id}
                                                control={<Radio />}
                                                label={
                                                    <Box>
                                                        <Typography variant="subtitle1">{resume.version_name}</Typography>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Uploaded: {new Date(resume.created_at).toLocaleString()}
                                                        </Typography>
                                                        {resume.is_default && (
                                                            <Typography variant="caption" color="primary">
                                                                Default Resume
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </RadioGroup>

                            <Box mt={2}>
                                <Button
                                    variant="outlined"
                                    component="a"
                                    href="/register"
                                    target="_blank"
                                >
                                    Manage Resumes
                                </Button>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                You don't have any resume versions uploaded.
                            </Alert>
                            <Button
                                variant="contained"
                                component="a"
                                href="/register"
                                target="_blank"
                            >
                                Upload Resume
                            </Button>
                        </Paper>
                    )}

                    <Box display="flex" justifyContent="space-between" mt={3}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting || !selectedResumeId || resumeVersions.length === 0}
                        >
                            {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
                        </Button>
                    </Box>
                </form>
            )}
        </Box>
    );
}; 