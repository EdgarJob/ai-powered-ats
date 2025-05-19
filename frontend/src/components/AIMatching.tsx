import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    LinearProgress,
    Tooltip,
    SelectChangeEvent
} from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { analyzeJobMatch } from '../lib/openai-service';

// Define interfaces for the data
interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string;
    status: string;
    created_at: string;
}

interface Candidate {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    bio: string;
    location: string;
    education_level: string;
    profile_picture_url?: string;
    employment_history: {
        company: string;
        position: string;
        description: string;
    }[];
    certifications: {
        name: string;
        issuer: string;
    }[];
}

interface MatchResult {
    candidateId: string;
    first_name: string;
    last_name: string;
    matchScore: number;
    profile_picture_url?: string;
    email: string;
    matchDetails: {
        category: string;
        score: number;
        matches: { requirement: string; matched: boolean; reason: string }[];
    }[];
}

// Helper function to get color based on match score
const getMatchColor = (score: number): string => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
};

// Helper function to get different colors for different category types
const getCategoryColor = (category: string, score: number): string => {
    // Base color determination by score
    const baseColor = getMatchColor(score);

    // Slight variations based on category
    switch (category) {
        case 'Skills':
            return baseColor;
        case 'Education':
            return baseColor === '#4caf50' ? '#2e7d32' :
                baseColor === '#ff9800' ? '#e65100' : '#c62828';
        case 'Experience':
            return baseColor === '#4caf50' ? '#388e3c' :
                baseColor === '#ff9800' ? '#ef6c00' : '#b71c1c';
        case 'Industry Fit':
            return baseColor === '#4caf50' ? '#1b5e20' :
                baseColor === '#ff9800' ? '#bf360c' : '#8e0000';
        case 'Responsibility Match':
            return baseColor === '#4caf50' ? '#43a047' :
                baseColor === '#ff9800' ? '#f57c00' : '#d32f2f';
        default:
            return baseColor;
    }
};

export function AIMatching() {
    // State for jobs and candidates
    const [jobs, setJobs] = useState<Job[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>('');
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [usingAI, setUsingAI] = useState<boolean>(false);
    const [showFallbackData, setShowFallbackData] = useState(false);

    // Fallback sample data
    const fallbackJobs: Job[] = [
        {
            id: 'job-1',
            title: 'Senior Software Engineer',
            description: 'We are looking for an experienced software engineer proficient in React, Node.js, and cloud technologies to join our engineering team.',
            requirements: ['React', 'Node.js', 'TypeScript', 'AWS', '5+ years experience'],
            responsibilities: 'Design and develop scalable web applications, collaborate with cross-functional teams, mentor junior developers.',
            status: 'published',
            created_at: new Date().toISOString()
        },
        {
            id: 'job-2',
            title: 'Product Manager',
            description: 'Seeking a product manager to lead product strategy and roadmap planning for our SaaS platform.',
            requirements: ['3+ years product management', 'SaaS experience', 'User research', 'Agile methodologies'],
            responsibilities: 'Define product vision, create roadmaps, work with engineering teams to deliver features.',
            status: 'published',
            created_at: new Date().toISOString()
        },
        {
            id: 'job-3',
            title: 'UX/UI Designer',
            description: 'Join our design team to create beautiful, intuitive interfaces for our enterprise software products.',
            requirements: ['Figma', 'User research', 'Interaction design', 'Design systems'],
            responsibilities: 'Create wireframes, prototypes, and visual designs. Conduct user research and testing.',
            status: 'published',
            created_at: new Date().toISOString()
        }
    ];

    const fallbackCandidates: Candidate[] = [
        {
            id: 'candidate-1',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            bio: 'Software engineer with 6 years of experience in full-stack development using React, Node.js, and AWS.',
            location: 'San Francisco, CA',
            education_level: 'Bachelor',
            employment_history: [
                {
                    company: 'Tech Solutions Inc',
                    position: 'Senior Developer',
                    description: 'Led the development of React-based frontend applications and Node.js microservices.'
                },
                {
                    company: 'WebApps Co',
                    position: 'JavaScript Developer',
                    description: 'Built responsive web applications using modern JavaScript frameworks.'
                }
            ],
            certifications: [
                {
                    name: 'AWS Certified Developer',
                    issuer: 'Amazon Web Services'
                }
            ]
        },
        {
            id: 'candidate-2',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@example.com',
            bio: 'Product manager with experience in SaaS products and agile methodologies.',
            location: 'New York, NY',
            education_level: 'Masters',
            employment_history: [
                {
                    company: 'SaaS Platform Inc',
                    position: 'Product Manager',
                    description: 'Led product strategy and roadmap planning for enterprise SaaS platform.'
                },
                {
                    company: 'Software Solutions',
                    position: 'Associate Product Manager',
                    description: 'Assisted in feature prioritization and user research.'
                }
            ],
            certifications: [
                {
                    name: 'Certified Scrum Product Owner',
                    issuer: 'Scrum Alliance'
                }
            ]
        },
        {
            id: 'candidate-3',
            first_name: 'Michael',
            last_name: 'Wong',
            email: 'michael.wong@example.com',
            bio: 'UI/UX designer specializing in creating intuitive interfaces and design systems.',
            location: 'Seattle, WA',
            education_level: 'Bachelor',
            employment_history: [
                {
                    company: 'Design Agency',
                    position: 'Senior UX Designer',
                    description: 'Created wireframes, prototypes, and visual designs for enterprise clients.'
                },
                {
                    company: 'Tech Startup',
                    position: 'UI Designer',
                    description: 'Designed user interfaces for mobile and web applications.'
                }
            ],
            certifications: [
                {
                    name: 'UX Certification',
                    issuer: 'Nielsen Norman Group'
                }
            ]
        }
    ];

    // Fetch jobs and candidates on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                setShowFallbackData(false);

                // Fetch jobs
                const { data: jobsData, error: jobsError } = await supabaseAdmin
                    .from('jobs')
                    .select('*')
                    .eq('status', 'published');

                if (jobsError) {
                    console.error('Error fetching jobs:', jobsError);
                    setError('Failed to connect to the database. Showing sample data instead.');

                    // Show fallback data after timeout
                    setTimeout(() => {
                        setShowFallbackData(true);
                        setJobs(fallbackJobs);
                        setCandidates(fallbackCandidates);
                        setLoading(false);
                    }, 2000);

                    return;
                }

                // Fetch candidates
                const { data: candidatesData, error: candidatesError } = await supabaseAdmin
                    .from('candidates')
                    .select('*');

                if (candidatesError) {
                    console.error('Error fetching candidates:', candidatesError);
                    setError('Failed to connect to the database. Showing sample data instead.');

                    // Show fallback data after timeout
                    setTimeout(() => {
                        setShowFallbackData(true);
                        setJobs(jobsData || fallbackJobs);
                        setCandidates(fallbackCandidates);
                        setLoading(false);
                    }, 2000);

                    return;
                }

                setJobs(jobsData || []);
                setCandidates(candidatesData || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load jobs and candidates. Showing sample data instead.');

                // Show fallback data
                setTimeout(() => {
                    setShowFallbackData(true);
                    setJobs(fallbackJobs);
                    setCandidates(fallbackCandidates);
                    setLoading(false);
                }, 2000);
            }
        };

        fetchData();
    }, []);

    // Handle job selection change
    const handleJobChange = (event: SelectChangeEvent) => {
        setSelectedJob(event.target.value);
        setMatchResults([]);
        setSuccess(null);
        setError(null);
    };

    // Match candidates to the selected job
    const matchCandidatesToJob = async () => {
        try {
            setAnalyzing(true);
            setError(null);
            setSuccess(null);
            setUsingAI(false);

            const selectedJobData = jobs.find(job => job.id === selectedJob);
            if (!selectedJobData) {
                throw new Error('Selected job not found');
            }

            // Using OpenAI API for real AI-powered matching
            const matchResultsPromises = candidates.map(async (candidate) => {
                try {
                    // Call OpenAI service
                    const analysis = await analyzeJobMatch(
                        selectedJobData.requirements,
                        selectedJobData.description,
                        {
                            bio: candidate.bio || '',
                            employment_history: candidate.employment_history || [],
                            certifications: candidate.certifications || [],
                            education_level: candidate.education_level || ''
                        }
                    );

                    setUsingAI(true);

                    return {
                        candidateId: candidate.id,
                        first_name: candidate.first_name,
                        last_name: candidate.last_name,
                        profile_picture_url: candidate.profile_picture_url,
                        email: candidate.email,
                        matchScore: analysis.overallScore,
                        matchDetails: analysis.categoryScores
                    };
                } catch (err) {
                    console.error(`Error analyzing candidate ${candidate.id}:`, err);
                    // Return null for failed analysis to filter out later
                    return null;
                }
            });

            // Wait for all promises to resolve
            const results = await Promise.all(matchResultsPromises);

            // Filter out failed analyses and sort by match score
            const validResults = results
                .filter((result) => result !== null)
                .map(result => result as MatchResult)
                .sort((a, b) => b.matchScore - a.matchScore);

            setMatchResults(validResults);
            setSuccess(`Successfully matched ${validResults.length} candidates ${usingAI ? 'using OpenAI GPT-4o-mini model' : 'using fallback algorithm'}`);
        } catch (err) {
            console.error('Error in AI matching:', err);
            setError('Failed to complete AI matching. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6">Loading AI Matching Data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
                AI Candidate Matching
            </Typography>

            {showFallbackData && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Database connection failed. Showing sample data for demonstration purposes.
                </Alert>
            )}

            <Typography variant="body1" color="text.secondary" paragraph>
                Use AI to find the best candidates for your job openings based on skills, experience, and education.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={0} variant="outlined">
                <Typography variant="h6" gutterBottom>
                    Select a Job
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="job-select-label">Job Position</InputLabel>
                    <Select
                        labelId="job-select-label"
                        value={selectedJob}
                        onChange={handleJobChange}
                        label="Job Position"
                    >
                        <MenuItem value="">
                            <em>Select a job</em>
                        </MenuItem>
                        {jobs.map(job => (
                            <MenuItem key={job.id} value={job.id}>
                                {job.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedJob && (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                This will analyze {candidates.length} candidate profiles against the selected job requirements.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={matchCandidatesToJob}
                            disabled={analyzing}
                            startIcon={analyzing ? <CircularProgress size={20} /> : <WorkIcon />}
                        >
                            {analyzing ? 'Analyzing Candidates...' : 'Match Candidates'}
                        </Button>
                    </>
                )}
            </Paper>

            {analyzing && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        AI is analyzing candidate profiles...
                    </Typography>
                    <LinearProgress />
                </Box>
            )}

            {matchResults.length > 0 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Match Results
                        {usingAI && (
                            <Chip
                                label="AI-POWERED"
                                color="primary"
                                size="small"
                                sx={{ ml: 2, backgroundColor: '#3f51b5' }}
                            />
                        )}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        {matchResults.length} candidates ranked by match score {usingAI ? 'using advanced AI analysis' : 'using algorithm'}
                    </Typography>

                    <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                        {matchResults.map((result, index) => (
                            <React.Fragment key={result.candidateId}>
                                {index > 0 && <Divider variant="inset" component="li" />}
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={result.profile_picture_url}
                                            sx={{ width: 56, height: 56 }}
                                        >
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" component="div">
                                                {result.first_name} {result.last_name}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {result.email}
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    {result.matchDetails.map((detail, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={`${detail.category}: ${Math.round(detail.score)}%`}
                                                            size="small"
                                                            sx={{
                                                                mr: 1,
                                                                mb: 1,
                                                                bgcolor: getCategoryColor(detail.category, detail.score) + '22',
                                                                color: getCategoryColor(detail.category, detail.score),
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title={`${result.matchScore}% match with job requirements`}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: getMatchColor(result.matchScore)
                                                    }}
                                                >
                                                    {result.matchScore}%
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>

                                {/* Detailed match explanation expandable */}
                                <Box sx={{ pl: 9, pr: 3, pb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Match Details:
                                    </Typography>
                                    <Box>
                                        {result.matchDetails.flatMap(detail =>
                                            detail.matches.map((match, i) => (
                                                <Box
                                                    key={`${detail.category}-${i}`}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {match.matched ? (
                                                        <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                                    ) : (
                                                        <CancelIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                                                    )}
                                                    <Typography variant="body2">
                                                        {match.reason}
                                                    </Typography>
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </Box>
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
} 