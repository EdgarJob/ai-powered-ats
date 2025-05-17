import React from 'react';
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
  Tooltip
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut();
    navigate('/login');
  };

  // Navigation items for admins
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Current Job Openings', href: '/' },
    { name: 'Job Management', href: '/jobs' },
    { name: 'View Candidates', href: '/candidates' },
    { name: 'AI Matching', href: '/ai-matching' }
  ];

  // Navigation items for regular users
  const userNavigation = [
    { name: 'Current Job Openings', href: '/' },
    { name: 'Register as Candidate', href: '/register' }
  ];

  // Determine which navigation items to show based on user role
  const navigation = userRole === 'admin' ? adminNavigation : userNavigation;

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
                  >
                    <AccountCircle />
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
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  bgcolor: location.pathname === '/login' ? 'primary.dark' : 'transparent',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>

      {/* Footer */}
      <Paper component="footer" square variant="outlined" sx={{ py: 3, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © 2024 AI-Powered ATS. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}