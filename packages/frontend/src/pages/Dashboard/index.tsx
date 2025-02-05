import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  Box as MuiBox,
  Card,
  CardContent,
  Grid as MuiGrid,
  Typography as MuiTypography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Paper as MuiPaper,
} from '@mui/material';
import {
  Person as PersonIcon,
  MedicalServices as TreatmentIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';

function getStatusColor(status: string) {
  switch (status) {
    case 'booked':
      return 'primary';
    case 'ongoing':
      return 'warning';
    case 'canceled':
      return 'error';
    default:
      return 'default';
  }
}

const Dashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      fetchDoctorAppointments();
    }
  }, [user]);

  const fetchDoctorAppointments = async () => {
    try {
      if (!user?._id) return;

      const appointments = await appointmentService.getDoctorAppointments(user._id);
      const today = new Date();
      const todayAppts = appointments.filter(app => 
        isSameDay(new Date(app.startTime), today)
      );
      setTodayAppointments(todayAppts);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const DoctorAppointmentsSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <MuiTypography variant="h6" gutterBottom>
          Today's Appointments
        </MuiTypography>
        {todayAppointments.length === 0 ? (
          <MuiTypography color="textSecondary" align="center">
            No appointments today
          </MuiTypography>
        ) : (
          <List disablePadding>
            {todayAppointments.map((appointment, index) => (
              <Box key={appointment._id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MuiTypography variant="subtitle1">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </MuiTypography>
                        <Chip
                          size="small"
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <MuiTypography variant="body2">
                              {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                            </MuiTypography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TreatmentIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <MuiTypography variant="body2">
                              {appointment.treatment.name}
                            </MuiTypography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      <MuiGrid container spacing={3} sx={{ mt: 2 }}>
        {user?.role === 'DOCTOR' && (
          <MuiGrid item xs={12}>
            <DoctorAppointmentsSection />
          </MuiGrid>
        )}

        <MuiGrid item xs={12} md={6} lg={3}>
          <MuiPaper
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
            <MuiTypography variant="h6" gutterBottom>
              Today's Appointments
            </MuiTypography>
            <MuiTypography variant="h3">0</MuiTypography>
          </MuiPaper>
        </MuiGrid>

        <MuiGrid item xs={12} md={6} lg={3}>
          <MuiPaper
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
            <MuiTypography variant="h6" gutterBottom>
              Total Patients
            </MuiTypography>
            <MuiTypography variant="h3">0</MuiTypography>
          </MuiPaper>
        </MuiGrid>

        <MuiGrid item xs={12} md={6} lg={3}>
          <MuiPaper
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
            <MuiTypography variant="h6" gutterBottom>
              Available Rooms
            </MuiTypography>
            <MuiTypography variant="h3">0</MuiTypography>
          </MuiPaper>
        </MuiGrid>

        <MuiGrid item xs={12} md={6} lg={3}>
          <MuiPaper
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
            <MuiTypography variant="h6" gutterBottom>
              Active Doctors
            </MuiTypography>
            <MuiTypography variant="h3">0</MuiTypography>
          </MuiPaper>
        </MuiGrid>
      </MuiGrid>
    </Box>
  );
};

export default Dashboard;
