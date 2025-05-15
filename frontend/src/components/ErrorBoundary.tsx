import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import config from '../lib/config';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error in development
        if (config.environment === 'development') {
            console.error('React Error:', error);
            console.error('Error Info:', errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        Something went wrong
                    </Typography>
                    {config.environment === 'development' && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {this.state.error?.message}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={this.handleReset}
                        sx={{ mr: 1 }}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
} 