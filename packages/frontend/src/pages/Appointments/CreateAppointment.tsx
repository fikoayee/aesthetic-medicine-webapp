import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { toast } from 'react-toastify';

interface NewPatientData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | 'not_specified';
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}

interface AppointmentData {
  doctorId: number | '';
  treatmentId: number | '';
  roomId: number | '';
  startTime: Date | null;
  price: number;
  note: string;
}

const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    doctorId: '',
    treatmentId: '',
    roomId: '',
    startTime: null,
    price: 0,
    note: '',
  });
  const [newPatientData, setNewPatientData] = useState<NewPatientData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: null,
    gender: 'not_specified',
    address: {
      street: '',
      city: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [doctorsData, treatmentsData, roomsData] = await Promise.all([
          appointmentService.getDoctors(),
          appointmentService.getTreatments(),
          appointmentService.getRooms(),
        ]);
        setDoctors(doctorsData);
        setTreatments(treatmentsData);
        setRooms(roomsData);
      } catch (error) {
        toast.error('Error loading initial data');
        console.error('Error:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await appointmentService.searchPatients(searchQuery);
          setPatients(results);
        } catch (error) {
          console.error('Error searching patients:', error);
        }
      }
    };
    searchPatients();
  }, [searchQuery]);

  const handleAppointmentDataChange = (field: keyof AppointmentData, value: any) => {
    setAppointmentData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill price when treatment is selected
    if (field === 'treatmentId') {
      const treatment = treatments.find((t) => t.id === value);
      if (treatment) {
        setAppointmentData((prev) => ({
          ...prev,
          price: treatment.price,
        }));
      }
    }
  };

  const handleNewPatientDataChange = (field: string, value: any) => {
    setNewPatientData((prev) => ({
      ...prev,
      ...(field.includes('.')
        ? {
            address: {
              ...prev.address,
              [field.split('.')[1]]: value,
            },
          }
        : { [field]: value }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const appointmentEndTime = new Date(appointmentData.startTime!);
      appointmentEndTime.setHours(appointmentEndTime.getHours() + 1); // Default 1-hour appointment

      const submitData = {
        ...(patientType === 'existing' ? { patientId: selectedPatientId } : { newPatient: newPatientData }),
        appointment: {
          ...appointmentData,
          endTime: appointmentEndTime,
        },
      };

      await appointmentService.createAppointment(submitData);
      toast.success('Appointment created successfully');
      navigate('/appointments');
    } catch (error) {
      toast.error('Error creating appointment');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Appointment
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Patient Information
            </Typography>

            <RadioGroup
              row
              value={patientType}
              onChange={(e) => setPatientType(e.target.value as 'existing' | 'new')}
            >
              <FormControlLabel value="existing" control={<Radio />} label="Existing Patient" />
              <FormControlLabel value="new" control={<Radio />} label="New Patient" />
            </RadioGroup>

            {patientType === 'existing' ? (
              <Autocomplete
                fullWidth
                options={patients}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                onChange={(_, value) => setSelectedPatientId(value?.id || '')}
                onInputChange={(_, value) => setSearchQuery(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                )}
              />
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={newPatientData.firstName}
                    onChange={(e) => handleNewPatientDataChange('firstName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={newPatientData.lastName}
                    onChange={(e) => handleNewPatientDataChange('lastName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => handleNewPatientDataChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={newPatientData.phoneNumber}
                    onChange={(e) => handleNewPatientDataChange('phoneNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Birth Date"
                      value={newPatientData.birthDate}
                      onChange={(date) => handleNewPatientDataChange('birthDate', date)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={newPatientData.gender}
                      onChange={(e) => handleNewPatientDataChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="not_specified">Not Specified</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={newPatientData.address.street}
                    onChange={(e) => handleNewPatientDataChange('address.street', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={newPatientData.address.city}
                    onChange={(e) => handleNewPatientDataChange('address.city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={newPatientData.address.postalCode}
                    onChange={(e) => handleNewPatientDataChange('address.postalCode', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={appointmentData.doctorId}
                    onChange={(e) => handleAppointmentDataChange('doctorId', e.target.value)}
                    label="Doctor"
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Treatment</InputLabel>
                  <Select
                    value={appointmentData.treatmentId}
                    onChange={(e) => handleAppointmentDataChange('treatmentId', e.target.value)}
                    label="Treatment"
                  >
                    {treatments.map((treatment) => (
                      <MenuItem key={treatment.id} value={treatment.id}>
                        {treatment.name} (${treatment.price})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={appointmentData.roomId}
                    onChange={(e) => handleAppointmentDataChange('roomId', e.target.value)}
                    label="Room"
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Appointment Time"
                    value={appointmentData.startTime}
                    onChange={(date) => handleAppointmentDataChange('startTime', date)}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={appointmentData.price}
                  onChange={(e) => handleAppointmentDataChange('price', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <Box component="span">$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={appointmentData.note}
                  onChange={(e) => handleAppointmentDataChange('note', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/appointments')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateAppointment;
