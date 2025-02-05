import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import DoctorIcon from '@mui/icons-material/LocalHospital';
import TimerIcon from '@mui/icons-material/Timer';
import SpaIcon from '@mui/icons-material/Spa';
import { toast } from 'react-toastify';
import StatCard from './StatCard';
import TreatmentCard from './TreatmentCard';
import { statisticsService, DashboardStatistics } from '../../services/statisticsService';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStatistics>({
    monthlyAppointments: 0,
    monthlyPatients: 0,
    totalDoctors: 0,
    avgAppointmentsPerDay: 0,
    popularTreatments: [],
    totalPatients: 0,
    avgTreatmentDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      setLoading(true);
      const data = await statisticsService.getDashboardStatistics();
      console.log('Received dashboard data:', data);
      setStats(data);
    } catch (error) {
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      });
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Appointments"
            value={stats.monthlyAppointments}
            icon={CalendarIcon}
            color="#306ad0"
            tooltip="Total number of appointments this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Patients"
            value={stats.monthlyPatients}
            icon={PersonIcon}
            color="#00bfa5"
            tooltip="Number of unique patients this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon={DoctorIcon}
            color="#f57c00"
            tooltip="Total number of doctors in the clinic"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Daily Appointments"
            value={stats.avgAppointmentsPerDay}
            icon={TimerIcon}
            color="#7c4dff"
            tooltip="Average number of appointments per day this month"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <TreatmentCard treatments={stats.popularTreatments} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                subtitle="registered in the clinic"
                icon={PersonIcon}
                color="#43a047"
                tooltip="Total number of patients registered in the clinic"
              />
            </Grid>
            <Grid item xs={12}>
              <StatCard
                title="Most Popular Treatment"
                value={stats.popularTreatments[0]?.name || 'N/A'}
                subtitle={stats.popularTreatments[0] ? `${stats.popularTreatments[0].count} appointments` : ''}
                icon={SpaIcon}
                color="#e53935"
                tooltip="Most requested treatment this month"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
