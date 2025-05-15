import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { JobsList } from './components/JobsList';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<JobsList />} />
              <Route path="jobs" element={<JobsList />} />
              <Route path="jobs/:id" element={<div>Job Details</div>} />
              <Route path="candidates" element={<div>Candidates</div>} />
              <Route path="analytics" element={<div>Analytics</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;