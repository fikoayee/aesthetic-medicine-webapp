import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { appointmentService, AppointmentFormData, NewPatientData } from '../../services/appointmentService';
import { Doctor } from '../../services/doctorService';
import { Treatment } from '../../services/treatmentService';
import { Room } from '../../services/roomService';
import { Patient } from '../../types/patient';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialAppointmentData: AppointmentFormData = {
  doctorId: '',
  treatmentId: '',
  roomId: '',
  startTime: '',
  endTime: '',
  price: 0,
  note: '',
};

const initialNewPatientData: NewPatientData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  gender: 'not_specified',
  address: {
    street: '',
    city: '',
    postalCode: '',
  },
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');
  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>(initialAppointmentData);
  const [newPatientData, setNewPatientData] = useState<NewPatientData>(initialNewPatientData);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Data for dropdowns
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (open) {
      fetchInitialData();
    }
  }, [open]);

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

  const handleAppointmentDataChange = (field: keyof AppointmentFormData, value: any) => {
    setAppointmentData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill price when treatment is selected
    if (field === 'treatmentId') {
      const treatment = treatments.find((t) => t._id === value);
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

  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      handleAppointmentDataChange(type === 'start' ? 'startTime' : 'endTime', formattedDate);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...(patientType === 'existing' ? { patientId: selectedPatientId } : { newPatient: newPatientData }),
        appointment: appointmentData,
      };

      await appointmentService.createAppointment(submitData);
      toast.success('Appointment created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Error creating appointment');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Appointment</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
          </Grid>

          {patientType === 'existing' ? (
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={patients}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                onChange={(_, value) => setSelectedPatientId(value?._id || '')}
                onInputChange={(_, value) => setSearchQuery(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Search Patient" variant="outlined" />
                )}
              />
            </Grid>
          ) : (
            <>
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
                    value={newPatientData.birthDate ? new Date(newPatientData.birthDate) : null}
                    onChange={(date) => handleNewPatientDataChange('birthDate', date ? format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") : '')}
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
            </>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Appointment Details
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={appointmentData.doctorId}
                onChange={(e) => handleAppointmentDataChange('doctorId', e.target.value)}
                label="Doctor"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {`${doctor.firstName} ${doctor.lastName}`}
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
                  <MenuItem key={treatment._id} value={treatment._id}>
                    {`${treatment.name} ($${treatment.price})`}
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
                  <MenuItem key={room._id} value={room._id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={appointmentData.startTime ? new Date(appointmentData.startTime) : null}
                onChange={(date) => handleDateChange(date, 'start')}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Time"
                value={appointmentData.endTime ? new Date(appointmentData.endTime) : null}
                onChange={(date) => handleDateChange(date, 'end')}
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
                startAdornment: '$',
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal;
