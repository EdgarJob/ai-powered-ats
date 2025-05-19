import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Divider,
    Tabs,
    Tab,
    Avatar,
} from '@mui/material';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function UserProfile() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState<any>(null);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [bio, setBio] = useState('');

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError('');

                // Get candidate data linked to current user
                const { data, error } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (error) {
                    throw error;
                }

                setProfileData(data);

                // Populate form fields
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setGender(data.gender || '');
                setLocation(data.location || '');
                setBio(data.bio || '');

                // Format date for input
                if (data.date_of_birth) {
                    const date = new Date(data.date_of_birth);
                    setDateOfBirth(date.toISOString().split('T')[0]);
                }

            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Handle edit mode toggle
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError('');
        setSuccess('');
    };

    // Handle save profile
    const handleSaveProfile = async () => {
        if (!user || !profileData) return;

        try {
            setSaving(true);
            setError('');

            const updatedData = {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                gender: gender,
                location: location,
                date_of_birth: dateOfBirth,
                bio: bio,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('candidates')
                .update(updatedData)
                .eq('id', profileData.id);

            if (error) {
                throw error;
            }

            setSuccess('Profile updated successfully');
            setIsEditing(false);

            // Update the profile data with new values
            setProfileData({ ...profileData, ...updatedData });

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box p={3}>
                <Alert severity="warning">
                    No profile found. Please complete your registration.
                </Alert>
            </Box>
        );
    }

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" fontWeight="bold" mb={4}>
                My Profile
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem',
                                }}
                            >
                                {firstName && lastName ? `${firstName[0]}${lastName[0]}` : 'U'}
                            </Avatar>

                            <Typography variant="h5" fontWeight="medium">
                                {firstName} {lastName}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {email}
                            </Typography>

                            {!isEditing && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={handleEditToggle}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                                Profile Information
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Location:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography variant="body2">
                                            {location || 'Not specified'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Phone:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography variant="body2">
                                            {phone || 'Not specified'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Gender:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                            {gender || 'Not specified'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Birth Date:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography variant="body2">
                                            {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 0 }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                                <Tab label="About" />
                                <Tab label="Applications" />
                                <Tab label="Resume" />
                            </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index={0}>
                            {isEditing ? (
                                <Box component="form">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={email}
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Gender</InputLabel>
                                                <Select
                                                    value={gender}
                                                    label="Gender"
                                                    onChange={(e) => setGender(e.target.value)}
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="non-binary">Non-binary</MenuItem>
                                                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="City, Country"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Date of Birth"
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
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
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleEditToggle}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                        >
                                            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Bio
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {bio || 'No bio available.'}
                                    </Typography>
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h6" gutterBottom>
                                Job Applications
                            </Typography>
                            <ApplicationsList candidateId={profileData.id} />
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h6" gutterBottom>
                                Resume Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload and manage your resume versions here. You can create different versions for different job types.
                            </Typography>
                            <Box sx={{ mt: 3 }}>
                                <Alert severity="info">
                                    Resume management is coming soon. Please check back later.
                                </Alert>
                            </Box>
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

// Component to display a user's job applications
function ApplicationsList({ candidateId }: { candidateId: string }) {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('job_applications')
                    .select(`
                        *,
                        job:jobs(id, title, status, metadata, deadline)
                    `)
                    .eq('candidate_id', candidateId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setApplications(data || []);

            } catch (err: any) {
                console.error('Error fetching applications:', err);
                setError(err.message || 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [candidateId]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (applications.length === 0) {
        return <Alert severity="info">You haven't applied to any jobs yet.</Alert>;
    }

    return (
        <Box>
            {applications.map((application) => (
                <Card key={application.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6">{application.job?.title || 'Unnamed Job'}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Applied on: {new Date(application.created_at).toLocaleDateString()}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Application Status:
                                </Typography>
                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                    {application.status}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Job Status:
                                </Typography>
                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                    {application.job?.status || 'Unknown'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
} 