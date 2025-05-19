import React from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

// Fallback job data
const fallbackJobs = [
    {
        id: 'sample-1',
        title: 'Software Engineer',
        description: 'We are looking for a skilled software engineer to join our development team to build innovative web applications using modern technologies.',
        location: 'Remote',
        industry: 'Technology',
        field: 'Software Development',
        requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Git'],
        responsibilities: '- Develop and maintain web applications\n- Write clean, efficient code\n- Collaborate with cross-functional teams\n- Troubleshoot and debug applications\n- Implement responsive design and ensure cross-browser compatibility'
    },
    {
        id: 'sample-2',
        title: 'Product Manager',
        description: 'Join our product team to lead the development of innovative products. You will work closely with engineering, design, and marketing teams to define product strategy.',
        location: 'New York, NY',
        industry: 'Technology',
        field: 'Product Management',
        requirements: ['Product Management', 'Agile', 'User Experience', 'Market Research', 'Data Analysis'],
        responsibilities: '- Define product strategy and roadmap\n- Gather and prioritize requirements\n- Work with engineering teams to deliver features\n- Analyze market trends and competition\n- Work with design team to create intuitive user experiences'
    },
    {
        id: 'sample-3',
        title: 'UX/UI Designer',
        description: 'We are seeking a talented UX/UI Designer to create amazing user experiences. You will work on designing intuitive and engaging interfaces for our products.',
        location: 'San Francisco, CA',
        industry: 'Design',
        field: 'User Experience',
        requirements: ['UI Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        responsibilities: '- Create wireframes, prototypes, and high-fidelity designs\n- Conduct user research and usability testing\n- Collaborate with developers to implement designs\n- Create and maintain design systems\n- Stay up-to-date with design trends and best practices'
    }
];

interface FallbackJobsListProps {
    onRetry: () => void;
    onDiagnostics: () => void;
}

export function FallbackJobsList({ onRetry, onDiagnostics }: FallbackJobsListProps) {
    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Alert
                severity="warning"
                sx={{ mb: 4 }}
                action={
                    <Box>
                        <Button color="inherit" size="small" onClick={onRetry} sx={{ mr: 1 }}>
                            Retry Connection
                        </Button>
                        <Button
                            component={Link}
                            to="/diagnostics"
                            color="inherit"
                            size="small"
                        >
                            Run Diagnostics
                        </Button>
                    </Box>
                }
            >
                We're having trouble connecting to our job database. Showing sample job listings. You can try refreshing the page or check the system status.
            </Alert>

            <Typography variant="h4" fontWeight="bold" mb={3}>Sample Job Listings</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {fallbackJobs.map(job => (
                    <Card key={job.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" fontWeight="600" mb={1}>{job.title}</Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                {job.location && (
                                    <Chip
                                        label={job.location}
                                        size="small"
                                        color="default"
                                        variant="outlined"
                                    />
                                )}
                                {job.industry && (
                                    <Chip
                                        label={job.industry}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {job.field && (
                                    <Chip
                                        label={job.field}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <Typography variant="body1" paragraph>
                                {job.description}
                            </Typography>

                            {job.responsibilities && (
                                <Box mb={2}>
                                    <Typography variant="subtitle1" fontWeight="600" mb={1}>Responsibilities:</Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            whiteSpace: 'pre-line',
                                            bgcolor: '#f9f9f9',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        {job.responsibilities}
                                    </Typography>
                                </Box>
                            )}

                            {job.requirements && job.requirements.length > 0 && (
                                <Box mb={2}>
                                    <Typography variant="subtitle1" fontWeight="600" mb={1}>Required Skills:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {job.requirements.map((req, index) => (
                                            <Chip
                                                key={index}
                                                label={req}
                                                size="small"
                                                color="primary"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Box mt={3}>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    <em>This is a sample job listing. Job applications are unavailable while the system is in maintenance mode.</em>
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={onRetry}
                                >
                                    Retry Connection
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
} 