import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    Grid,
    Chip,
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import { Person, Email, Phone, LocationOn, Work, School } from '@mui/icons-material';
import { getCandidates, type Candidate } from '../lib/candidate-service';

export function CandidatesList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
    const queryClient = useQueryClient();

    // Fetch candidates using React Query
    const { data: candidates = [], isLoading, error, refetch } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => getCandidates(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fallback sample data for when there are no candidates
    const fallbackCandidates: Candidate[] = [
        {
            id: 'sample-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@example.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            currentPosition: 'Senior Software Engineer',
            yearsOfExperience: 5,
            skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
            education: [
                {
                    degree: 'B.S. Computer Science',
                    institution: 'Stanford University',
                    year: 2019
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'sample-user-1'
        },
        {
            id: 'sample-2',
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@example.com',
            phone: '(555) 987-6543',
            location: 'Seattle, WA',
            currentPosition: 'Product Manager',
            yearsOfExperience: 7,
            skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
            education: [
                {
                    degree: 'MBA',
                    institution: 'University of Washington',
                    year: 2018
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'sample-user-2'
        },
        {
            id: 'sample-3',
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.rodriguez@example.com',
            phone: '(555) 456-7890',
            location: 'Austin, TX',
            currentPosition: 'UX Designer',
            yearsOfExperience: 4,
            skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
            education: [
                {
                    degree: 'B.A. Design',
                    institution: 'University of Texas',
                    year: 2020
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'sample-user-3'
        }
    ];

    // Use real data if available, otherwise use fallback
    const displayCandidates = candidates.length > 0 ? candidates : fallbackCandidates;
    const showFallbackData = candidates.length === 0 && !isLoading;

    // Filter candidates based on search criteria
    const filteredCandidates = displayCandidates.filter(candidate => {
        const matchesSearch = searchTerm === '' ||
            `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSkill = skillFilter === '' ||
            candidate.skills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));

        const matchesLocation = locationFilter === '' ||
            candidate.location?.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesSearch && matchesSkill && matchesLocation;
    });

    // Get unique skills for filter dropdown
    const allSkills = Array.from(new Set(displayCandidates.flatMap(c => c.skills)));
    const allLocations = Array.from(new Set(displayCandidates.map(c => c.location).filter(Boolean)));

    const handleViewProfile = (candidate: Candidate) => {
        setSnackbar({
            open: true,
            message: `Viewing profile for ${candidate.firstName} ${candidate.lastName}`,
            severity: 'info'
        });
        // TODO: Navigate to detailed candidate profile page
    };

    const handleContactCandidate = (candidate: Candidate) => {
        setSnackbar({
            open: true,
            message: `Contact feature coming soon for ${candidate.firstName} ${candidate.lastName}`,
            severity: 'info'
        });
        // TODO: Open contact/messaging interface
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading candidates...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Candidates</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSnackbar({ open: true, message: 'Add candidate feature coming soon!', severity: 'info' })}
                >
                    Add Candidate
                </Button>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading candidates: {error instanceof Error ? error.message : 'Unknown error'}
                </Alert>
            )}

            {showFallbackData && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Using sample data. No candidates found in the database.
                </Alert>
            )}

            {/* Search and Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Search candidates"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, or position..."
                    sx={{ minWidth: 250, flex: 1 }}
                />
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Skill</InputLabel>
                    <Select
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        label="Filter by Skill"
                    >
                        <MenuItem value="">All Skills</MenuItem>
                        {allSkills.map(skill => (
                            <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Location</InputLabel>
                    <Select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        label="Filter by Location"
                    >
                        <MenuItem value="">All Locations</MenuItem>
                        {allLocations.map(location => (
                            <MenuItem key={location} value={location}>{location}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Results Summary */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredCandidates.length} of {displayCandidates.length} candidates
            </Typography>

            {/* Candidates Grid */}
            {filteredCandidates.length === 0 ? (
                <Alert severity="info">
                    No candidates match your search criteria.
                </Alert>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
                    {filteredCandidates.map((candidate) => (
                        <Box key={candidate.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Header with Avatar and Name */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {getInitials(candidate.firstName, candidate.lastName)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">
                                                {candidate.firstName} {candidate.lastName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {candidate.currentPosition || 'Position not specified'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Contact Information */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">{candidate.email}</Typography>
                                        </Box>
                                        {candidate.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">{candidate.phone}</Typography>
                                            </Box>
                                        )}
                                        {candidate.location && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">{candidate.location}</Typography>
                                            </Box>
                                        )}
                                        {candidate.yearsOfExperience && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Work sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {candidate.yearsOfExperience} years experience
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Skills */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Skills:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {candidate.skills.slice(0, 4).map((skill, index) => (
                                                <Chip
                                                    key={index}
                                                    label={skill}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                            {candidate.skills.length > 4 && (
                                                <Chip
                                                    label={`+${candidate.skills.length - 4} more`}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Education */}
                                    {candidate.education && candidate.education.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <School sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {candidate.education[0].degree} - {candidate.education[0].institution}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleViewProfile(candidate)}
                                            fullWidth
                                        >
                                            View Profile
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleContactCandidate(candidate)}
                                            fullWidth
                                        >
                                            Contact
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 