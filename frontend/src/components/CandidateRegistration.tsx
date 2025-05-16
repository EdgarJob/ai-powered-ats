import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Divider,
    Avatar,
    FormHelperText,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { supabaseAdmin } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Database } from '../lib/database.types';

// Types for form data
interface CandidateData {
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
}

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

// Draft storage key
const DRAFT_STORAGE_KEY = 'candidate_registration_draft';

// Interface for saved draft data 
interface DraftData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    gender: string;
    location: string;
    dateOfBirth: string;
    profilePicPreview: string | null;
    educationLevel: string;
    certifications: Certification[];
    employmentHistory: Employment[];
    currentSalary: string;
    currency: string;
    activeStep: number;
    savedAt: string;
}

// Custom styled components
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// Helper functions for validation
const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhone = (phone: string): boolean => {
    // Tanzania phone format: +255 followed by 9 digits
    const regex = /^\+255\s?[0-9]{9}$/;
    return regex.test(phone);
};

export function CandidateRegistration() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [educationLevel, setEducationLevel] = useState('');
    const [certifications, setCertifications] = useState<Certification[]>([
        { id: uuidv4(), name: '', issuer: '', date_acquired: '' }
    ]);
    const [employmentHistory, setEmploymentHistory] = useState<Employment[]>([
        {
            id: uuidv4(),
            company: '',
            position: '',
            start_date: '',
            end_date: '',
            is_current: false,
            description: ''
        }
    ]);
    const [currentSalary, setCurrentSalary] = useState<string>('');
    const [currency, setCurrency] = useState<string>('TZS'); // Default to TZS
    const [resume, setResume] = useState<File | null>(null);
    const [resumeName, setResumeName] = useState<string>('');

    // UI state
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Draft handling state
    const [openDraftDialog, setOpenDraftDialog] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [draftDate, setDraftDate] = useState<string | null>(null);
    const [savingDraft, setSavingDraft] = useState(false);
    const [showDraftSaved, setShowDraftSaved] = useState(false);

    // Form validation state
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        dateOfBirth?: string;
        education?: string;
        certifications?: {
            [key: string]: {
                name?: string;
                issuer?: string;
                date_acquired?: string;
            }
        };
        employment?: {
            [key: string]: {
                company?: string;
                position?: string;
                start_date?: string;
                end_date?: string;
                description?: string;
            }
        };
    }>({});

    // Steps for the stepper
    const steps = [
        'Personal Information',
        'Education & Certifications',
        'Employment History',
        'Documents & Review'
    ];

    // Check for existing draft on component mount
    useEffect(() => {
        checkForExistingDraft();
    }, []);

    // Function to check for existing draft
    const checkForExistingDraft = () => {
        try {
            const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (savedDraft) {
                const parsedDraft: DraftData = JSON.parse(savedDraft);
                setHasDraft(true);

                // Format the date for display
                const draftDate = new Date(parsedDraft.savedAt);
                setDraftDate(draftDate.toLocaleString());

                // Show dialog to ask user if they want to restore
                setOpenDraftDialog(true);
            }
        } catch (error) {
            console.error('Error checking for draft:', error);
            // Clear potentially corrupted draft
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
    };

    // Function to load saved draft
    const loadDraft = () => {
        try {
            const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (savedDraft) {
                const parsedDraft: DraftData = JSON.parse(savedDraft);

                // Restore all form values
                setFirstName(parsedDraft.firstName);
                setLastName(parsedDraft.lastName);
                setEmail(parsedDraft.email);
                setPhone(parsedDraft.phone);
                setBio(parsedDraft.bio);
                setGender(parsedDraft.gender);
                setLocation(parsedDraft.location);
                setDateOfBirth(parsedDraft.dateOfBirth);
                setProfilePicPreview(parsedDraft.profilePicPreview);
                setEducationLevel(parsedDraft.educationLevel);
                setCertifications(parsedDraft.certifications);
                setEmploymentHistory(parsedDraft.employmentHistory);
                setCurrentSalary(parsedDraft.currentSalary);
                setCurrency(parsedDraft.currency);

                // Set active step
                setActiveStep(parsedDraft.activeStep);
            }
        } catch (error) {
            console.error('Error loading draft:', error);
            setError('Failed to load your saved draft. Starting with a new form.');
        }

        // Close the dialog
        setOpenDraftDialog(false);
    };

    // Function to discard draft
    const discardDraft = () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        setOpenDraftDialog(false);
    };

    // Function to save current form as draft
    const saveDraft = () => {
        try {
            setSavingDraft(true);

            // Create draft object
            const draftData: DraftData = {
                firstName,
                lastName,
                email,
                phone,
                bio,
                gender,
                location,
                dateOfBirth,
                profilePicPreview,
                educationLevel,
                certifications,
                employmentHistory,
                currentSalary,
                currency,
                activeStep,
                savedAt: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));

            setHasDraft(true);
            setShowDraftSaved(true);
        } catch (error) {
            console.error('Error saving draft:', error);
            setError('Failed to save your draft. Please try again.');
        } finally {
            setSavingDraft(false);
        }
    };

    // Function to clear draft after successful submission
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
    };

    // Handle profile picture selection
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePic(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePicPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle resume file selection
    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResume(file);
            setResumeName(file.name);
        }
    };

    // Add a new certification
    const addCertification = () => {
        setCertifications([
            ...certifications,
            { id: uuidv4(), name: '', issuer: '', date_acquired: '' }
        ]);
    };

    // Remove a certification
    const removeCertification = (id: string) => {
        setCertifications(certifications.filter(cert => cert.id !== id));
    };

    // Update a certification
    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(certifications.map(cert =>
            cert.id === id ? { ...cert, [field]: value } : cert
        ));
    };

    // Add a new employment entry
    const addEmployment = () => {
        setEmploymentHistory([
            ...employmentHistory,
            {
                id: uuidv4(),
                company: '',
                position: '',
                start_date: '',
                end_date: '',
                is_current: false,
                description: ''
            }
        ]);
    };

    // Remove an employment entry
    const removeEmployment = (id: string) => {
        setEmploymentHistory(employmentHistory.filter(emp => emp.id !== id));
    };

    // Update an employment entry
    const updateEmployment = (id: string, field: keyof Employment, value: any) => {
        setEmploymentHistory(employmentHistory.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    // Handle current employment checkbox
    const handleCurrentEmployment = (id: string, checked: boolean) => {
        setEmploymentHistory(employmentHistory.map(emp =>
            emp.id === id ? {
                ...emp,
                is_current: checked,
                end_date: checked ? '' : emp.end_date
            } : emp
        ));
    };

    // Validate the current step
    const validateStep = (): boolean => {
        const newErrors: any = {};

        if (activeStep === 0) {
            // Validate personal information
            if (!firstName.trim()) newErrors.firstName = 'First name is required';
            if (!lastName.trim()) newErrors.lastName = 'Last name is required';
            if (!email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!isValidEmail(email)) {
                newErrors.email = 'Please enter a valid email address';
            }
            if (phone && !isValidPhone(phone)) {
                newErrors.phone = 'Please enter a valid phone number';
            }
            if (!dateOfBirth) {
                newErrors.dateOfBirth = 'Date of birth is required';
            } else {
                const dobDate = new Date(dateOfBirth);
                const today = new Date();
                const age = today.getFullYear() - dobDate.getFullYear();
                if (age < 16 || age > 100) {
                    newErrors.dateOfBirth = 'Please enter a valid date of birth (16-100 years old)';
                }
            }
        } else if (activeStep === 1) {
            // Validate education
            if (!educationLevel) newErrors.education = 'Education level is required';

            // Validate certifications (at least name and issuer for filled ones)
            const certErrors: { [key: string]: { name?: string, issuer?: string } } = {};
            certifications.forEach((cert, index) => {
                if (cert.name && !cert.issuer) {
                    certErrors[`cert-${index}`] = { issuer: 'Issuer is required' };
                } else if (!cert.name && cert.issuer) {
                    certErrors[`cert-${index}`] = { name: 'Name is required' };
                }
            });
            if (Object.keys(certErrors).length > 0) {
                newErrors.certifications = certErrors;
            }
        } else if (activeStep === 2) {
            // Validate employment (if any entry is partially filled, all required fields must be filled)
            const empErrors: { [key: string]: { company?: string, position?: string, start_date?: string, end_date?: string } } = {};
            employmentHistory.forEach((emp, index) => {
                const hasPartialInfo = emp.company || emp.position || emp.start_date;

                if (hasPartialInfo) {
                    if (!emp.company) empErrors[`emp-${index}`] = { ...(empErrors[`emp-${index}`] || {}), company: 'Company is required' };
                    if (!emp.position) empErrors[`emp-${index}`] = { ...(empErrors[`emp-${index}`] || {}), position: 'Position is required' };
                    if (!emp.start_date) empErrors[`emp-${index}`] = { ...(empErrors[`emp-${index}`] || {}), start_date: 'Start date is required' };

                    // Validate end date for non-current positions
                    if (!emp.is_current && !emp.end_date) {
                        empErrors[`emp-${index}`] = { ...(empErrors[`emp-${index}`] || {}), end_date: 'End date is required for past positions' };
                    }
                }
            });

            if (Object.keys(empErrors).length > 0) {
                newErrors.employment = empErrors;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle step navigation
    const handleNext = () => {
        if (validateStep()) {
            setActiveStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    // Upload file to Supabase storage
    const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            console.log(`Uploading file to ${bucket}/${filePath}`);

            // Add file options including content type
            const options = {
                cacheControl: '3600',
                contentType: file.type || 'application/octet-stream'
            };

            const { error: uploadError, data } = await supabaseAdmin
                .storage
                .from(bucket)
                .upload(filePath, file, options);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            console.log('File uploaded successfully, getting public URL');

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log('Public URL:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('File upload error:', error);
            return null;
        }
    };

    // Function to format number with thousand separators
    const formatNumberWithCommas = (value: string): string => {
        // Remove existing commas first
        const numberValue = value.replace(/,/g, '');

        // Add commas for thousands
        return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Function to handle salary input with formatting
    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Get cursor position before update
        const cursorPosition = e.target.selectionStart;

        // Get the raw value
        const rawValue = e.target.value;

        // Remove non-numeric characters except decimal point
        const numericValue = rawValue.replace(/[^0-9.]/g, '');

        // Count commas before cursor position to adjust cursor later
        const commaCountBeforeCursor = (rawValue.substring(0, cursorPosition || 0).match(/,/g) || []).length;

        // Format with commas
        const formattedValue = formatNumberWithCommas(numericValue);

        // Get new comma count to determine cursor adjustment
        const newCommaCountBeforeCursor = (formattedValue.substring(0, (cursorPosition || 0) + 1).match(/,/g) || []).length;

        // Set the formatted value
        setCurrentSalary(formattedValue);

        // Adjust cursor position after React re-renders the component
        setTimeout(() => {
            const input = document.getElementById('salary-input') as HTMLInputElement;
            if (input && cursorPosition !== null) {
                // Adjust cursor position based on added/removed commas
                const adjustment = newCommaCountBeforeCursor - commaCountBeforeCursor;
                input.setSelectionRange(cursorPosition + adjustment, cursorPosition + adjustment);
            }
        }, 0);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Perform final validation
        if (!validateStep()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Upload profile picture if provided
            let profilePicUrl = null;
            if (profilePic) {
                profilePicUrl = await uploadFile(profilePic, 'profile-pictures', 'candidates');
                if (!profilePicUrl) {
                    throw new Error('Failed to upload profile picture');
                }
            }

            // Upload resume if provided
            let resumeUrl = null;
            if (resume) {
                resumeUrl = await uploadFile(resume, 'resumes', 'candidates');
                if (!resumeUrl) {
                    throw new Error('Failed to upload resume');
                }
            }

            // Prepare candidate data
            const candidateId = uuidv4();
            const candidateData: CandidateData = {
                id: candidateId,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                bio: bio,
                gender: gender,
                location: location,
                date_of_birth: dateOfBirth,
                profile_picture_url: profilePicUrl || undefined,
                education_level: educationLevel,
                certifications: certifications.filter(cert => cert.name && cert.issuer),
                employment_history: employmentHistory.filter(emp => emp.company && emp.position),
                current_salary: currentSalary ? parseFloat(currentSalary.replace(/,/g, '')) : undefined,
                salary_currency: currency,
                resume_url: resumeUrl || undefined,
                created_at: new Date().toISOString()
            };

            // Insert candidate record
            const { error: insertError } = await supabaseAdmin
                .from('candidates')
                .insert([candidateData]);

            if (insertError) {
                console.error('Error inserting candidate data:', insertError);
                throw new Error(insertError.message);
            }

            // Success! 
            setSuccess('Registration successful! You can now apply for jobs.');

            // Clear the draft after successful submission
            clearDraft();

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render the appropriate step content
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Personal Information</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                    type="email"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    error={!!errors.phone}
                                    helperText={errors.phone || "Format: +2551234567890"}
                                    placeholder="+2551234567890"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="gender-label">Gender</InputLabel>
                                    <Select
                                        labelId="gender-label"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        label="Gender"
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
                                    error={!!errors.dateOfBirth}
                                    helperText={errors.dateOfBirth}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center">
                                    <Box mr={2}>
                                        <Avatar
                                            src={profilePicPreview || undefined}
                                            sx={{ width: 80, height: 80 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{ mb: 1 }}
                                        >
                                            Upload Photo
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePicChange}
                                                ref={fileInputRef}
                                            />
                                        </Button>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Optional. Max size: 5MB
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    multiline
                                    rows={4}
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Education & Certifications</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.education}>
                                    <InputLabel id="education-level-label">Highest Level of Education</InputLabel>
                                    <Select
                                        labelId="education-level-label"
                                        value={educationLevel}
                                        onChange={(e) => setEducationLevel(e.target.value)}
                                        label="Highest Level of Education"
                                        required
                                    >
                                        <MenuItem value="high-school">High School</MenuItem>
                                        <MenuItem value="associate">Associate Degree</MenuItem>
                                        <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                                        <MenuItem value="master">Master's Degree</MenuItem>
                                        <MenuItem value="doctorate">Doctorate</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                    {errors.education && <FormHelperText>{errors.education}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Professional Certifications
                                </Typography>

                                {certifications.map((cert, index) => (
                                    <Paper key={cert.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Certification Name"
                                                    value={cert.name}
                                                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                                    error={!!(errors.certifications && errors.certifications[`cert-${index}`]?.name)}
                                                    helperText={errors.certifications && errors.certifications[`cert-${index}`]?.name}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Issuing Organization"
                                                    value={cert.issuer}
                                                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                                    error={!!(errors.certifications && errors.certifications[`cert-${index}`]?.issuer)}
                                                    helperText={errors.certifications && errors.certifications[`cert-${index}`]?.issuer}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Date Acquired"
                                                    type="date"
                                                    value={cert.date_acquired}
                                                    onChange={(e) => updateCertification(cert.id, 'date_acquired', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {certifications.length > 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={() => removeCertification(cert.id)}
                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Paper>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addCertification}
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                >
                                    Add Certification
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Employment History</Typography>

                        {employmentHistory.map((emp, index) => (
                            <Paper key={emp.id} sx={{ p: 2, mb: 3, position: 'relative' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            value={emp.company}
                                            onChange={(e) => updateEmployment(emp.id, 'company', e.target.value)}
                                            error={!!(errors.employment && errors.employment[`emp-${index}`]?.company)}
                                            helperText={errors.employment && errors.employment[`emp-${index}`]?.company}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Position"
                                            value={emp.position}
                                            onChange={(e) => updateEmployment(emp.id, 'position', e.target.value)}
                                            error={!!(errors.employment && errors.employment[`emp-${index}`]?.position)}
                                            helperText={errors.employment && errors.employment[`emp-${index}`]?.position}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Start Date"
                                            type="date"
                                            value={emp.start_date}
                                            onChange={(e) => updateEmployment(emp.id, 'start_date', e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            error={!!(errors.employment && errors.employment[`emp-${index}`]?.start_date)}
                                            helperText={errors.employment && errors.employment[`emp-${index}`]?.start_date}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center">
                                            <Box mr={2} flexGrow={1}>
                                                <TextField
                                                    fullWidth
                                                    label="End Date"
                                                    type="date"
                                                    value={emp.end_date}
                                                    onChange={(e) => updateEmployment(emp.id, 'end_date', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                    disabled={emp.is_current}
                                                    error={!!(errors.employment && errors.employment[`emp-${index}`]?.end_date)}
                                                    helperText={errors.employment && errors.employment[`emp-${index}`]?.end_date}
                                                />
                                            </Box>
                                            <Box>
                                                <Button
                                                    variant={emp.is_current ? "contained" : "outlined"}
                                                    size="small"
                                                    onClick={() => handleCurrentEmployment(emp.id, !emp.is_current)}
                                                >
                                                    Current Job
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Job Description"
                                            value={emp.description}
                                            onChange={(e) => updateEmployment(emp.id, 'description', e.target.value)}
                                            multiline
                                            rows={3}
                                            placeholder="Describe your responsibilities and achievements..."
                                        />
                                    </Grid>
                                </Grid>

                                {employmentHistory.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => removeEmployment(emp.id)}
                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Paper>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addEmployment}
                            variant="outlined"
                            sx={{ mt: 1 }}
                        >
                            Add Employment
                        </Button>

                        <Box mt={3}>
                            <Typography variant="subtitle1" gutterBottom>
                                Current Take-Home Salary (Optional)
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FormControl sx={{ width: 120 }}>
                                    <InputLabel id="currency-label">Currency</InputLabel>
                                    <Select
                                        labelId="currency-label"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        label="Currency"
                                    >
                                        <MenuItem value="TZS">TZS</MenuItem>
                                        <MenuItem value="USD">USD</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Current Take-Home Salary"
                                    value={currentSalary}
                                    onChange={handleSalaryChange}
                                    placeholder={currency === "TZS" ? "e.g. 2,000,000" : "e.g. 1,200"}
                                    sx={{ width: 300 }}
                                    id="salary-input"
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Please enter your monthly take-home salary after taxes
                            </Typography>
                        </Box>
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Documents & Review</Typography>

                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Upload Resume (Optional)
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ mr: 2 }}
                                >
                                    Select Resume
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleResumeChange}
                                        ref={resumeInputRef}
                                    />
                                </Button>
                                <Typography>
                                    {resumeName || 'No file selected'}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Accepted formats: PDF, DOC, DOCX. Max size: 10MB
                            </Typography>
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Review Your Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Personal Details</Typography>
                                    <Box mt={2}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Name:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{firstName} {lastName}</Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{email}</Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{phone || 'Not provided'}</Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Gender:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{gender || 'Not provided'}</Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Location:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{location || 'Not provided'}</Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not provided'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Education & Certifications</Typography>
                                    <Box mt={2}>
                                        <Typography variant="body2" color="text.secondary">Education Level:</Typography>
                                        <Typography variant="body2" mb={1}>{educationLevel || 'Not provided'}</Typography>

                                        <Typography variant="body2" color="text.secondary">Certifications:</Typography>
                                        {certifications.filter(c => c.name && c.issuer).length > 0 ? (
                                            certifications.filter(c => c.name && c.issuer).map((cert, index) => (
                                                <Typography key={cert.id} variant="body2">
                                                    {index + 1}. {cert.name} by {cert.issuer}
                                                    {cert.date_acquired && ` (${new Date(cert.date_acquired).toLocaleDateString()})`}
                                                </Typography>
                                            ))
                                        ) : (
                                            <Typography variant="body2">No certifications added</Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Employment History</Typography>
                                    <Box mt={2}>
                                        {employmentHistory.filter(e => e.company && e.position).length > 0 ? (
                                            employmentHistory.filter(e => e.company && e.position).map((emp, index) => (
                                                <Box key={emp.id} mb={index < employmentHistory.length - 1 ? 2 : 0}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {emp.position} at {emp.company}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {emp.start_date ? new Date(emp.start_date).toLocaleDateString() : '?'} -
                                                        {emp.is_current ? ' Present' : emp.end_date ? ` ${new Date(emp.end_date).toLocaleDateString()}` : ' ?'}
                                                    </Typography>
                                                    {emp.description && (
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                            {emp.description}
                                                        </Typography>
                                                    )}
                                                    {index < employmentHistory.filter(e => e.company && e.position).length - 1 && <Divider sx={{ mt: 1.5 }} />}
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2">No employment history added</Typography>
                                        )}

                                        {currentSalary && (
                                            <Box mt={2}>
                                                <Typography variant="body2" color="text.secondary">Current Take-Home Salary:</Typography>
                                                <Typography variant="body2">
                                                    {currency === 'TZS' ?
                                                        `${currentSalary} TZS` :
                                                        `$${currentSalary} USD`} (Monthly)
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return <Box>Unknown step</Box>;
        }
    };

    return (
        <Box maxWidth="lg" mx="auto" p={3}>
            <Typography variant="h4" mb={4} fontWeight="bold">Candidate Registration</Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Draft Restore Dialog */}
            <Dialog
                open={openDraftDialog}
                onClose={() => setOpenDraftDialog(false)}
                aria-labelledby="draft-dialog-title"
            >
                <DialogTitle id="draft-dialog-title">
                    Resume your registration
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        We found a saved draft from {draftDate}. Would you like to continue from where you left off?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={discardDraft} color="error">
                        Discard Draft
                    </Button>
                    <Button onClick={loadDraft} variant="contained" color="primary">
                        Continue Draft
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Draft Saved Snackbar */}
            <Snackbar
                open={showDraftSaved}
                autoHideDuration={4000}
                onClose={() => setShowDraftSaved(false)}
                message="Progress saved! You can return later to continue."
            />

            <form onSubmit={handleSubmit}>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    {renderStepContent()}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                    >
                        Back
                    </Button>

                    <Box display="flex" gap={2}>
                        {/* Save as Draft Button */}
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={saveDraft}
                            disabled={isSubmitting || savingDraft}
                        >
                            {savingDraft ? 'Saving...' : 'Save as Draft'}
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                                sx={{ minWidth: 120 }}
                            >
                                {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </form>
        </Box>
    );
} 