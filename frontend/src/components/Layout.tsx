import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Paper } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Apply for Jobs', href: '/' },
    { name: 'Register as Candidate', href: '/register' },
    { name: 'View Candidates', href: '/candidates' },
    { name: 'Job Management', href: '/jobs' }
  ];

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