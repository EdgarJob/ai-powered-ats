// @ts-nocheck - Disable TypeScript checking for this file to resolve React Router compatibility issues
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { JobWrapper } from './components/JobWrapper';
import { JobOpeningsWrapper } from './components/JobOpeningsWrapper';
import { UserProfileWrapper } from './components/UserProfileWrapper';
import { Dashboard } from './components/Dashboard';
import { AIMatchingWrapper } from './components/AIMatchingWrapper';
import { JobApplicationWrapper } from './components/JobApplicationWrapper';
import { LoginWrapper } from './components/LoginWrapper';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRegistration } from './components/UserRegistration';
import { SampleDataGeneratorWrapper } from './components/SampleDataGeneratorWrapper';
import { checkFirebaseConnection } from './lib/firebase';
import FirebaseTest from './components/FirebaseTest';

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
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // Initialize Firebase connection
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('Checking Firebase connection...');
        const connectionCheck = await checkFirebaseConnection();

        if (connectionCheck.success) {
          console.log('Firebase initialized successfully');
          setDbInitialized(true);
        } else {
          console.warn('Cannot connect to Firebase:', connectionCheck.error);
          setDbError(`Firebase connection error: ${connectionCheck.error}`);
          setUsingFallbackData(true);
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setDbError(`Firebase initialization error: ${error instanceof Error ? error.message : String(error)}`);
        setUsingFallbackData(true);
      }
    };

    initializeFirebase();
  }, []);

  // If we have a database error, we can still continue but show a warning
  useEffect(() => {
    if (dbError) {
      console.warn(`Database initialization encountered errors: ${dbError}. Using fallback data where needed.`);
    }
  }, [dbError]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<JobOpeningsWrapper />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<UserRegistration />} />
      <Route path="/apply/:jobId" element={
        <ProtectedRoute>
          <JobApplicationWrapper />
        </ProtectedRoute>
      } />

      {/* Member routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfileWrapper />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute adminOnly>
            <JobWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/candidates"
        element={
          <ProtectedRoute adminOnly>
            <JobWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/matching"
        element={
          <ProtectedRoute adminOnly>
            <AIMatchingWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/data-generator"
        element={
          <ProtectedRoute adminOnly>
            <SampleDataGeneratorWrapper />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <FirebaseTest />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Router>
              <Layout>
                <AppRoutes />
              </Layout>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;