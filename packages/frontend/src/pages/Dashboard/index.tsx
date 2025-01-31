import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '160px',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Today's Appointments
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '160px',
              background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Patients
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '160px',
              background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Available Rooms
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '160px',
              background: 'linear-gradient(45deg, #F50057 30%, #FF4081 90%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Active Doctors
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
