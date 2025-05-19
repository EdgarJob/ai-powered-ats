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
    TablePagination,
    TextField,
    InputAdornment,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    IconButton,
    Collapse,
    Tooltip,
    TableSortLabel
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
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';

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
    const [showFallbackData, setShowFallbackData] = useState(false);

    // Add filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [educationFilter, setEducationFilter] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');
    const [orderBy, setOrderBy] = useState<keyof Candidate>('created_at');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    // Keep track of unique filter options
    const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
    const [uniqueEducationLevels, setUniqueEducationLevels] = useState<string[]>([]);

    // Sample fallback candidate data that matches the Candidate interface
    const fallbackCandidates: Candidate[] = [
        {
            id: 'sample-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
            bio: 'Software engineer with 5 years of experience',
            gender: 'Male',
            location: 'San Francisco, CA',
            date_of_birth: '1990-01-15',
            education_level: 'Bachelor',
            certifications: [{ id: '1', name: 'AWS Certified Developer', issuer: 'Amazon', date_acquired: '2021-03-10' }],
            employment_history: [
                {
                    id: '1',
                    company: 'Tech Corp',
                    position: 'Senior Developer',
                    start_date: '2018-06-01',
                    is_current: true,
                    description: 'Full-stack development'
                }
            ],
            created_at: new Date().toISOString(),
            status: 'applied',
            job_id: 'job-1'
        },
        {
            id: 'sample-2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '555-987-6543',
            bio: 'Product manager with MBA',
            gender: 'Female',
            location: 'New York, NY',
            date_of_birth: '1988-07-22',
            education_level: 'Masters',
            certifications: [{ id: '1', name: 'PMP', issuer: 'PMI', date_acquired: '2019-05-20' }],
            employment_history: [
                {
                    id: '1',
                    company: 'Product Inc',
                    position: 'Product Manager',
                    start_date: '2017-03-15',
                    is_current: true,
                    description: 'Managing product roadmap'
                }
            ],
            created_at: new Date().toISOString(),
            status: 'interviewing',
            job_id: 'job-2'
        },
        {
            id: 'sample-3',
            first_name: 'Alex',
            last_name: 'Johnson',
            email: 'alex.johnson@example.com',
            phone: '555-456-7890',
            bio: 'Data scientist specializing in ML',
            gender: 'Non-binary',
            location: 'Austin, TX',
            date_of_birth: '1992-11-30',
            education_level: 'PhD',
            certifications: [{ id: '1', name: 'TensorFlow Developer', issuer: 'Google', date_acquired: '2022-01-15' }],
            employment_history: [
                {
                    id: '1',
                    company: 'AI Solutions',
                    position: 'Data Scientist',
                    start_date: '2020-02-01',
                    is_current: true,
                    description: 'Developing ML models'
                }
            ],
            created_at: new Date().toISOString(),
            status: 'rejected',
            job_id: 'job-3'
        }
    ];

    // Add a function to the component that serves as a retry mechanism
    const refetchCandidates = async () => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error } = await supabaseAdmin
                    .from('candidates')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching candidates:', error);
                    setError(error.message);

                    // Show fallback data after a timeout
                    setTimeout(() => {
                        setShowFallbackData(true);
                        setCandidates(fallbackCandidates);
                        setLoading(false);
                    }, 2000);

                    return;
                }

                if (data) {
                    // Extract unique values for filters
                    const locations = data
                        .map(candidate => candidate.location)
                        .filter((location): location is string =>
                            location !== null && location !== undefined && location !== '')
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .sort();

                    const educationLevels = data
                        .map(candidate => candidate.education_level)
                        .filter((level): level is string =>
                            level !== null && level !== undefined && level !== '')
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .sort();

                    setUniqueLocations(locations);
                    setUniqueEducationLevels(educationLevels);
                    setCandidates(data);
                }

                setLoading(false);
            } catch (err) {
                console.error('Exception fetching candidates:', err);
                setError(err instanceof Error ? err.message : String(err));
                setLoading(false);

                // Show fallback data after error
                setShowFallbackData(true);
                setCandidates(fallbackCandidates);
            }
        };

        await fetchCandidates();
    };

    // Replace the useEffect hook to use refetchCandidates
    useEffect(() => {
        refetchCandidates();
    }, []);

    // Add sorting handlers
    const handleRequestSort = (property: keyof Candidate) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Add filter handlers
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page on search
    };

    const handleEducationFilterChange = (event: SelectChangeEvent) => {
        setEducationFilter(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleLocationFilterChange = (event: SelectChangeEvent) => {
        setLocationFilter(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setEducationFilter('');
        setLocationFilter('');
        setPage(0);
    };

    const toggleFilterPanel = () => {
        setFilterOpen(!filterOpen);
    };

    // Filter and sort the candidates
    const processedCandidates = candidates
        .filter((candidate) => {
            // Apply search term filter (case-insensitive)
            const searchTermLower = searchTerm.toLowerCase();
            const nameMatch = `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTermLower);
            const emailMatch = candidate.email.toLowerCase().includes(searchTermLower);
            const searchMatch = nameMatch || emailMatch;

            // Apply education filter
            const educationMatch = !educationFilter || candidate.education_level === educationFilter;

            // Apply location filter
            const locationMatch = !locationFilter || candidate.location === locationFilter;

            return searchMatch && educationMatch && locationMatch;
        })
        .sort((a, b) => {
            const valueA = a[orderBy];
            const valueB = b[orderBy];

            if (valueA === valueB) return 0;

            // Handle null and undefined values
            if (valueA == null) return order === 'asc' ? -1 : 1;
            if (valueB == null) return order === 'asc' ? 1 : -1;

            // Compare based on value type
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return order === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            // For dates
            if (orderBy === 'created_at' || orderBy === 'date_of_birth') {
                const dateA = new Date(valueA as string);
                const dateB = new Date(valueB as string);
                return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }

            // For other types
            return order === 'asc'
                ? (valueA as number) - (valueB as number)
                : (valueB as number) - (valueA as number);
        });

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

    // In the render section, add a banner indicating fallback data
    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} minHeight="60vh">
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6">Loading Candidates...</Typography>
            </Box>
        );
    }

    if (error && !showFallbackData) {
        return (
            <Box p={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error: {error}
                </Alert>
                <Button variant="contained" onClick={refetchCandidates}>Retry</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>Registered Candidates</Typography>

            {showFallbackData && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Database connection failed. Showing sample candidate data for demonstration purposes.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            {candidates.length === 0 ? (
                <Alert severity="info">No candidates have registered yet.</Alert>
            ) : (
                <>
                    {/* Search and Filters */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name or email"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchTerm('')}
                                                    edge="end"
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item>
                                <Tooltip title="Toggle Filters">
                                    <IconButton onClick={toggleFilterPanel} color={filterOpen ? 'primary' : 'default'}>
                                        <FilterListIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            {(searchTerm || educationFilter || locationFilter) && (
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleClearFilters}
                                        startIcon={<ClearIcon />}
                                    >
                                        Clear Filters
                                    </Button>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Collapse in={filterOpen}>
                                    <Paper sx={{ p: 2, mt: 1 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel id="education-filter-label">Education Level</InputLabel>
                                                    <Select
                                                        labelId="education-filter-label"
                                                        value={educationFilter}
                                                        onChange={handleEducationFilterChange}
                                                        label="Education Level"
                                                    >
                                                        <MenuItem value="">
                                                            <em>All</em>
                                                        </MenuItem>
                                                        {uniqueEducationLevels.map((level) => (
                                                            <MenuItem key={level} value={level}>
                                                                {level}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel id="location-filter-label">Location</InputLabel>
                                                    <Select
                                                        labelId="location-filter-label"
                                                        value={locationFilter}
                                                        onChange={handleLocationFilterChange}
                                                        label="Location"
                                                    >
                                                        <MenuItem value="">
                                                            <em>All</em>
                                                        </MenuItem>
                                                        {uniqueLocations.map((location) => (
                                                            <MenuItem key={location} value={location}>
                                                                {location}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Collapse>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Results summary */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {processedCandidates.length} of {candidates.length} candidates
                        </Typography>
                    </Box>

                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'first_name'}
                                            direction={orderBy === 'first_name' ? order : 'asc'}
                                            onClick={() => handleRequestSort('first_name')}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'email'}
                                            direction={orderBy === 'email' ? order : 'asc'}
                                            onClick={() => handleRequestSort('email')}
                                        >
                                            Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'location'}
                                            direction={orderBy === 'location' ? order : 'asc'}
                                            onClick={() => handleRequestSort('location')}
                                        >
                                            Location
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'education_level'}
                                            direction={orderBy === 'education_level' ? order : 'asc'}
                                            onClick={() => handleRequestSort('education_level')}
                                        >
                                            Education
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'created_at'}
                                            direction={orderBy === 'created_at' ? order : 'asc'}
                                            onClick={() => handleRequestSort('created_at')}
                                        >
                                            Date Registered
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedCandidates
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

                                {processedCandidates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No candidates match the filter criteria
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={processedCandidates.length}
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