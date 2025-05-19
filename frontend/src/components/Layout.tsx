import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../lib/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Debug user role
  useEffect(() => {
    console.log('Layout - User role:', userRole);
    console.log('Layout - Is user logged in:', !!user);
  }, [user, userRole]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    setIsLoggingOut(true);

    try {
      // First clear any local storage data
      localStorage.clear();

      // Then call the signOut function
      await signOut();

      setLogoutMessage({
        type: 'success',
        message: 'You have been logged out successfully'
      });

      // Force refresh the page with a small delay to ensure logout completes
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error during logout:', error);
      setLogoutMessage({
        type: 'error',
        message: 'Failed to log out. Please try again.'
      });
      setIsLoggingOut(false);
    }
  };

  const handleSnackbarClose = () => {
    setLogoutMessage(null);
  };

  // Navigation items for admins - ensure all admin pages are included
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Job Openings', href: '/' },
    { name: 'Job Management', href: '/jobs' },
    { name: 'Candidates', href: '/candidates' },
    { name: 'AI Matching', href: '/ai-matching' },
    { name: 'Debug', href: '/debug' },
    { name: 'Diagnostics', href: '/diagnostics' }
  ];

  // Navigation items for regular members
  const memberNavigation = [
    { name: 'Job Openings', href: '/' },
    { name: 'My Profile', href: '/profile' }
  ];

  // Navigation items for public users (not logged in)
  // Reordered to put Login at the end (will be rightmost)
  const publicNavigation = [
    { name: 'Job Openings', href: '/' },
    { name: 'Register', href: '/register' },
    { name: 'Login', href: '/login' }
  ];

  // Determine which navigation items to show based on user role
  let navigation;
  if (!user) {
    navigation = publicNavigation;
  } else if (userRole === 'admin') {
    navigation = adminNavigation;
  } else if (userRole === 'member') {
    navigation = memberNavigation;
  } else {
    // Fallback to public navigation if role is not recognized
    navigation = publicNavigation;
  }

  console.log('Layout - Using navigation for role:', userRole, navigation);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            AI-Powered ATS
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navigation.map((item) => (
              // Don't show login/register buttons if user is logged in
              (user && (item.href === '/login' || item.href === '/register')) ? null : (
                <Button
                  key={item.href}
                  component={Link}
                  to={item.href}
                  sx={{
                    color: 'white',
                    bgcolor: location.pathname === item.href ? 'primary.dark' : 'transparent',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  {item.name}
                </Button>
              )
            ))}

            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <CircularProgress color="inherit" size={24} />
                    ) : (
                      <AccountCircle />
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled sx={{ opacity: 0.7 }}>
                    {user.email}
                    <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>
                      ({userRole})
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </MenuItem>
                </Menu>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>

      {/* Logout notification */}
      <Snackbar
        open={!!logoutMessage}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {logoutMessage ? (
          <Alert
            onClose={handleSnackbarClose}
            severity={logoutMessage.type}
            sx={{ width: '100%' }}
          >
            {logoutMessage.message}
          </Alert>
        ) : <div />}
      </Snackbar>

      {/* Footer */}
      <Paper component="footer" square variant="outlined" sx={{ py: 3, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © 2024 AI-Powered ATS. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}