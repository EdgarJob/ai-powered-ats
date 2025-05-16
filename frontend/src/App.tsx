// @ts-nocheck - Disable TypeScript checking for this file to resolve React Router compatibility issues
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { JobsList } from './components/JobsList';
import { JobApplicationForm } from './components/AddCandidateForm';
import { CandidateRegistration } from './components/CandidateRegistration';
import { addMetadataColumnToJobs, addResponsibilitiesColumn, updateCandidatesTableSchema } from './lib/database-helpers';
import { inspectJobsTable } from './lib/database-inspector';
import { refreshSchemaCache } from './lib/supabase';
import { fixDatabase, fixCandidatesTableSchema } from './lib/database-fix';
import { createRequiredStorageBuckets } from './lib/create-storage-buckets';
import DebugPanel from './components/Debug';
import { JobDebugPanel, StorageDebugPanel } from './components/Debug';
import { CandidatesList } from './components/CandidatesList';
import { Dashboard } from './components/Dashboard';
import { AIMatching } from './components/AIMatching';

// Create a theme instance with Apple-like design
const theme = createTheme({
  palette: {
    primary: {
      main: '#0071e3',
      light: '#47a6ff',
      dark: '#0040b0',
    },
    secondary: {
      main: '#ac39ff',
      light: '#e17cff',
      dark: '#7800cb',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient();

const AppRoutes = () => {
  // Initialize database schema
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database schema...');

        // Use our new direct database fix approach first
        console.log('Attempting direct database fix...');
        const fixResult = await fixDatabase();
        console.log('Database fix result:', fixResult);

        // Fix candidates table schema
        console.log('Attempting to fix candidates table schema...');
        const candidatesFixResult = await fixCandidatesTableSchema();
        console.log('Candidates schema fix result:', candidatesFixResult);

        // Create required storage buckets
        console.log('Creating required storage buckets...');
        const bucketsResult = await createRequiredStorageBuckets();
        console.log('Storage buckets setup result:', bucketsResult);

        // Then try the regular initialization approaches
        // First attempt to refresh the schema cache
        console.log('Refreshing schema cache to recognize new columns...');
        await refreshSchemaCache();

        await addMetadataColumnToJobs();

        // Add responsibilities column directly to the jobs table
        await addResponsibilitiesColumn();

        // Update candidates table schema with all required columns
        await updateCandidatesTableSchema();

        // Inspect the database structure to debug issues
        await inspectJobsTable();

        // Refresh the schema cache again after potential changes
        await refreshSchemaCache();

        console.log('Database schema initialization complete');
      } catch (error) {
        console.error('Error initializing database schema:', error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<JobApplicationForm />} />
      <Route path="/jobs" element={<JobsList />} />
      <Route path="/apply/:jobId" element={<JobApplicationForm />} />
      <Route path="/debug" element={<DebugPanel />} />
      <Route path="/fix-jobs" element={<JobDebugPanel />} />
      <Route path="/register" element={<CandidateRegistration />} />
      <Route path="/storage-debug" element={<StorageDebugPanel />} />
      <Route path="/candidates" element={<CandidatesList />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ai-matching" element={<AIMatching />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;