import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip, Button } from '@mui/material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AddJobForm } from './AddJobForm';

const columns: GridColDef[] = [
    { field: 'title', headerName: 'Job Title', width: 300 },
    {
        field: 'requirements',
        headerName: 'Requirements',
        width: 400,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {params.value.map((req: string) => (
                    <Chip key={req} label={req} size="small" />
                ))}
            </Box>
        )
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
            <Chip
                label={params.value}
                color={params.value === 'published' ? 'success' : params.value === 'draft' ? 'default' : 'error'}
            />
        )
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                onClick={() => params.row.onView(params.row.id)}
            >
                View Details
            </Button>
        )
    }
];

export function JobsList() {
    const navigate = useNavigate();

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(job => ({
                ...job,
                onView: (id: string) => navigate(`/jobs/${id}`)
            }));
        }
    });

    if (error) {
        return <Typography color="error">Error loading jobs: {error.message}</Typography>;
    }

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <AddJobForm />
            <Typography variant="h4" gutterBottom>
                Job Listings
            </Typography>
            <DataGrid
                rows={jobs || []}
                columns={columns}
                loading={isLoading}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                }}
            />
        </Box>
    );
} 