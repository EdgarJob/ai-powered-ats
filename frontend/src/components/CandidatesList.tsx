import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Chip,
    CircularProgress,
    Grid,
    Divider,
    Card,
    CardContent,
    CardActions,
    Alert,
    TablePagination
} from '@mui/material';
import { supabaseAdmin } from '../lib/supabase';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import PlaceIcon from '@mui/icons-material/Place';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

// Types based on the CandidateData from CandidateRegistration.tsx
interface Certification {
    id: string;
    name: string;
    issuer: string;
    date_acquired: string;
}

interface Employment {
    id: string;
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description: string;
}

interface Candidate {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio: string;
    gender: string;
    location: string;
    date_of_birth: string;
    profile_picture_url?: string;
    education_level: string;
    certifications: Certification[];
    employment_history: Employment[];
    current_salary?: number;
    salary_currency?: string;
    resume_url?: string;
    created_at: string;
    updated_at?: string;
    status?: string;
    job_id?: string;
}

export function CandidatesList() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch all candidates
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error } = await supabaseAdmin
                    .from('candidates')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setCandidates(data || []);
            } catch (err) {
                console.error('Error fetching candidates:', err);
                setError('Failed to load candidates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Handle dialog open/close
    const handleOpenDetails = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
    };

    // Handle pagination
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Format salary with currency symbol
    const formatSalary = (salary?: number, currency?: string) => {
        if (!salary) return 'Not specified';

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'TZS',
            maximumFractionDigits: 0
        });

        return formatter.format(salary);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        try {
            return format(new Date(dateString), 'PPP');
        } catch (error) {
            return dateString;
        }
    };

    // Render candidate details dialog
    const renderCandidateDetails = () => {
        if (!selectedCandidate) return null;

        return (
            <Dialog
                open={detailsOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Avatar
                            src={selectedCandidate.profile_picture_url}
                            sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Typography variant="h5">
                            {selectedCandidate.first_name} {selectedCandidate.last_name}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* Personal Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                Personal Information
                            </Typography>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                            </Box>
                                            <Typography variant="body1">{selectedCandidate.email}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                                            </Box>
                                            <Typography variant="body1">{selectedCandidate.phone || 'Not provided'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <CakeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                                            </Box>
                                            <Typography variant="body1">{formatDate(selectedCandidate.date_of_birth)}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">Location:</Typography>
                                            </Box>
                                            <Typography variant="body1">{selectedCandidate.location || 'Not provided'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Typography variant="body2" color="text.secondary">Gender:</Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                {selectedCandidate.gender || 'Not provided'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" alignItems="flex-start" mb={1}>
                                                <Typography variant="body2" color="text.secondary">Bio:</Typography>
                                            </Box>
                                            <Typography variant="body1">
                                                {selectedCandidate.bio || 'No bio provided'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Education & Certifications */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <SchoolIcon sx={{ mr: 1 }} /> Education & Certifications
                            </Typography>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>Highest Education Level</Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {selectedCandidate.education_level ? (
                                            <Chip
                                                label={selectedCandidate.education_level}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        ) : 'Not specified'}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle1" gutterBottom>Certifications</Typography>
                                    {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 ? (
                                        <Box>
                                            {selectedCandidate.certifications.map((cert) => (
                                                <Paper key={cert.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                                    <Typography variant="subtitle2">{cert.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Issuer: {cert.issuer}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Date Acquired: {formatDate(cert.date_acquired)}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No certifications listed
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Employment History */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <WorkIcon sx={{ mr: 1 }} /> Employment History
                            </Typography>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    {selectedCandidate.employment_history && selectedCandidate.employment_history.length > 0 ? (
                                        <Box>
                                            {selectedCandidate.employment_history.map((job) => (
                                                <Paper key={job.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                                    <Typography variant="subtitle1">{job.position}</Typography>
                                                    <Typography variant="subtitle2">{job.company}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(job.start_date)} - {job.is_current ? 'Present' : formatDate(job.end_date)}
                                                    </Typography>
                                                    {job.description && (
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            {job.description}
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No employment history listed
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Salary Information */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>Salary Information</Typography>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">Current Monthly Salary:</Typography>
                                    <Typography variant="h6">
                                        {formatSalary(selectedCandidate.current_salary, selectedCandidate.salary_currency)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Documents */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>Documents</Typography>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>Resume:</Typography>
                                        {selectedCandidate.resume_url ? (
                                            <Button
                                                variant="outlined"
                                                startIcon={<AttachFileIcon />}
                                                href={selectedCandidate.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Resume
                                            </Button>
                                        ) : (
                                            <Typography variant="body2">No resume uploaded</Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>Registered Candidates</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" my={5}>
                    <CircularProgress />
                </Box>
            ) : candidates.length === 0 ? (
                <Alert severity="info">No candidates have registered yet.</Alert>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Education</TableCell>
                                    <TableCell>Date Registered</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {candidates
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((candidate) => (
                                        <TableRow key={candidate.id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar
                                                        src={candidate.profile_picture_url}
                                                        sx={{ mr: 2, width: 40, height: 40 }}
                                                    />
                                                    <Typography>
                                                        {candidate.first_name} {candidate.last_name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{candidate.email}</TableCell>
                                            <TableCell>{candidate.location || 'N/A'}</TableCell>
                                            <TableCell>{candidate.education_level || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(candidate.created_at)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenDetails(candidate)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={candidates.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}

            {renderCandidateDetails()}
        </Box>
    );
} 