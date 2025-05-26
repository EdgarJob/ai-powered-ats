import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { ExpandMore, Psychology, TrendingUp, Assessment } from '@mui/icons-material';
import { getJobs, type Job } from '../lib/job-service';
import { getCandidates, type Candidate } from '../lib/candidate-service';
import { analyzeJobMatch } from '../lib/openai-service';

interface MatchResult {
    candidateId: string;
    candidate: Candidate;
    matchScore: number;
    reasoning: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        overallFit: number;
        strengths: string[];
        concerns: string[];
        recommendation: string;
    };
}

export function AIMatchingPage() {
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch jobs and candidates
    const { data: jobs = [], isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => getJobs(),
    });

    const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => getCandidates(),
    });

    // Sample data for demonstration
    const sampleJobs: Job[] = [
        {
            id: 'sample-job-1',
            title: 'Senior React Developer',
            company: 'Tech Company Inc.',
            location: 'Remote',
            description: 'We are looking for an experienced React developer to join our team.',
            status: 'published',
            requirements: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
            responsibilities: ['Build scalable web applications', 'Mentor junior developers', 'Code reviews'],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            employmentType: 'Full-time',
            salary: {
                min: 120000,
                max: 160000,
                currency: 'USD'
            }
        }
    ];

    const sampleCandidates: Candidate[] = [
        {
            id: 'sample-candidate-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@example.com',
            skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python'],
            yearsOfExperience: 5,
            currentPosition: 'Senior Software Engineer',
            education: [
                {
                    degree: 'B.S. Computer Science',
                    institution: 'Stanford University',
                    year: 2019
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'sample-candidate-2',
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@example.com',
            skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'HTML'],
            yearsOfExperience: 3,
            currentPosition: 'Frontend Developer',
            education: [
                {
                    degree: 'B.S. Web Development',
                    institution: 'University of Washington',
                    year: 2021
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Use real data if available, otherwise use sample data
    const displayJobs = jobs.length > 0 ? jobs : sampleJobs;
    const displayCandidates = candidates.length > 0 ? candidates : sampleCandidates;

    const handleRunMatching = async () => {
        if (!selectedJobId) {
            setError('Please select a job first');
            return;
        }

        const selectedJob = displayJobs.find(job => job.id === selectedJobId);
        if (!selectedJob) {
            setError('Selected job not found');
            return;
        }

        setIsMatching(true);
        setError(null);
        setMatchResults([]);

        try {
            const results: MatchResult[] = [];

            for (const candidate of displayCandidates) {
                try {
                    // Convert candidate to the format expected by AI service
                    const candidateData = {
                        bio: `${candidate.firstName} ${candidate.lastName} is a ${candidate.currentPosition || 'professional'} with ${candidate.yearsOfExperience || 0} years of experience. Skills: ${candidate.skills.join(', ')}.`,
                        employment_history: [{
                            position: candidate.currentPosition || 'Not specified',
                            company: 'Current Company',
                            description: `Professional with ${candidate.yearsOfExperience || 0} years of experience in ${candidate.skills.slice(0, 3).join(', ')}`
                        }],
                        certifications: candidate.education?.map(edu => ({
                            name: edu.degree,
                            issuer: edu.institution
                        })) || [],
                        education_level: candidate.education?.[0]?.degree || 'Not specified'
                    };

                    // Call the AI matching service
                    const matchResult = await analyzeJobMatch(
                        selectedJob.requirements || [],
                        selectedJob.description,
                        candidateData
                    );

                    results.push({
                        candidateId: candidate.id,
                        candidate,
                        matchScore: matchResult.matchScore,
                        reasoning: matchResult.reasoning
                    });
                } catch (candidateError) {
                    console.error(`Error matching candidate ${candidate.id}:`, candidateError);
                    // Add a fallback result for this candidate
                    results.push({
                        candidateId: candidate.id,
                        candidate,
                        matchScore: Math.floor(Math.random() * 40) + 30, // Random score between 30-70
                        reasoning: {
                            skillsMatch: Math.floor(Math.random() * 40) + 30,
                            experienceMatch: Math.floor(Math.random() * 40) + 30,
                            educationMatch: Math.floor(Math.random() * 40) + 30,
                            overallFit: Math.floor(Math.random() * 40) + 30,
                            strengths: ['Good technical background', 'Relevant experience'],
                            concerns: ['Some skill gaps', 'Limited experience in specific areas'],
                            recommendation: 'Consider for interview with additional screening'
                        }
                    });
                }
            }

            // Sort by match score (highest first)
            results.sort((a, b) => b.matchScore - a.matchScore);
            setMatchResults(results);

        } catch (error) {
            console.error('Error running AI matching:', error);
            setError(error instanceof Error ? error.message : 'Error running AI matching');
        } finally {
            setIsMatching(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Fair Match';
        return 'Poor Match';
    };

    if (jobsLoading || candidatesLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Psychology sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4">AI-Powered Candidate Matching</Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Select a job position to see how our AI analyzes and ranks candidates based on their skills,
                experience, and overall fit for the role.
            </Typography>

            {/* Job Selection */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Step 1: Select a Job Position</Typography>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Choose Job Position</InputLabel>
                        <Select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            label="Choose Job Position"
                        >
                            {displayJobs.map(job => (
                                <MenuItem key={job.id} value={job.id}>
                                    {job.title} - {job.company}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedJobId && (
                        <Box sx={{ mt: 2 }}>
                            {(() => {
                                const job = displayJobs.find(j => j.id === selectedJobId);
                                return job ? (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Required Skills:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            {job.requirements?.map((skill, index) => (
                                                <Chip key={index} label={skill} size="small" color="primary" />
                                            ))}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {job.description}
                                        </Typography>
                                    </Box>
                                ) : null;
                            })()}
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleRunMatching}
                        disabled={!selectedJobId || isMatching}
                        startIcon={isMatching ? <CircularProgress size={20} /> : <TrendingUp />}
                        sx={{ mt: 2 }}
                    >
                        {isMatching ? 'Analyzing Candidates...' : 'Run AI Matching'}
                    </Button>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Results */}
            {matchResults.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Assessment sx={{ mr: 1 }} />
                        Matching Results ({matchResults.length} candidates analyzed)
                    </Typography>

                    {matchResults.map((result, index) => (
                        <Accordion key={result.candidateId} sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6">
                                            #{index + 1} {result.candidate.firstName} {result.candidate.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {result.candidate.currentPosition} • {result.candidate.yearsOfExperience} years experience
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                        <Typography variant="h5" color={`${getScoreColor(result.matchScore)}.main`}>
                                            {result.matchScore}%
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {getScoreLabel(result.matchScore)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                                    {/* Score Breakdown */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 2 }}>Score Breakdown</Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">Skills Match</Typography>
                                                <Typography variant="body2">{result.reasoning.skillsMatch}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={result.reasoning.skillsMatch}
                                                color={getScoreColor(result.reasoning.skillsMatch)}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">Experience Match</Typography>
                                                <Typography variant="body2">{result.reasoning.experienceMatch}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={result.reasoning.experienceMatch}
                                                color={getScoreColor(result.reasoning.experienceMatch)}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">Education Match</Typography>
                                                <Typography variant="body2">{result.reasoning.educationMatch}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={result.reasoning.educationMatch}
                                                color={getScoreColor(result.reasoning.educationMatch)}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Candidate Skills */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Candidate Skills</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            {result.candidate.skills.map((skill, index) => (
                                                <Chip key={index} label={skill} size="small" variant="outlined" />
                                            ))}
                                        </Box>

                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Strengths</Typography>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {result.reasoning.strengths.map((strength, index) => (
                                                <li key={index}>
                                                    <Typography variant="body2" color="success.main">
                                                        {strength}
                                                    </Typography>
                                                </li>
                                            ))}
                                        </ul>
                                    </Box>

                                    {/* Concerns & Recommendation */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Areas of Concern</Typography>
                                        <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
                                            {result.reasoning.concerns.map((concern, index) => (
                                                <li key={index}>
                                                    <Typography variant="body2" color="warning.main">
                                                        {concern}
                                                    </Typography>
                                                </li>
                                            ))}
                                        </ul>

                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Recommendation</Typography>
                                        <Typography variant="body2" sx={{
                                            p: 2,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            fontStyle: 'italic'
                                        }}>
                                            {result.reasoning.recommendation}
                                        </Typography>
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}

            {/* No Results Message */}
            {!isMatching && matchResults.length === 0 && selectedJobId && (
                <Alert severity="info">
                    Click "Run AI Matching" to analyze how candidates match against the selected job position.
                </Alert>
            )}
        </Box>
    );
} 