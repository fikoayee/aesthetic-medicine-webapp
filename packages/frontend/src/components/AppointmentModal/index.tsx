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
  Box,
  FormHelperText,
  Paper
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { appointmentService, AppointmentFormData, NewPatientData, TimeSlotConflict } from '../../services/appointmentService';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<Array<{ startTime: string; endTime: string; roomId: string }>>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [conflicts, setConflicts] = useState<TimeSlotConflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

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

  useEffect(() => {
    const checkAvailability = async () => {
      if (appointmentData.doctorId && appointmentData.startTime) {
        setIsCheckingAvailability(true);
        try {
          const slots = await appointmentService.getAvailableSlots(
            appointmentData.doctorId,
            format(new Date(appointmentData.startTime), 'yyyy-MM-dd')
          );
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Error checking availability:', error);
          toast.error('Error checking doctor availability');
        } finally {
          setIsCheckingAvailability(false);
        }
      }
    };
    checkAvailability();
  }, [appointmentData.doctorId, appointmentData.startTime]);

  useEffect(() => {
    const checkConflicts = async () => {
      if (
        appointmentData.doctorId &&
        appointmentData.roomId &&
        appointmentData.startTime &&
        appointmentData.endTime &&
        (patientType === 'existing' ? selectedPatientId : true)
      ) {
        setIsCheckingConflicts(true);
        try {
          const conflicts = await appointmentService.checkForConflicts(
            appointmentData.doctorId,
            appointmentData.roomId,
            patientType === 'existing' ? selectedPatientId : '',
            appointmentData.startTime,
            appointmentData.endTime
          );
          setConflicts(conflicts);
        } catch (error) {
          console.error('Error checking conflicts:', error);
          toast.error('Error checking appointment conflicts');
        } finally {
          setIsCheckingConflicts(false);
        }
      } else {
        setConflicts([]);
      }
    };
    checkConflicts();
  }, [
    appointmentData.doctorId,
    appointmentData.roomId,
    appointmentData.startTime,
    appointmentData.endTime,
    selectedPatientId,
    patientType
  ]);

  const handleAppointmentDataChange = (field: keyof AppointmentFormData, value: any) => {
    setAppointmentData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill price and calculate end time when treatment is selected
    if (field === 'treatmentId') {
      const treatment = treatments.find((t) => t._id === value);
      if (treatment) {
        const updatedData: Partial<AppointmentFormData> = {
          price: treatment.price
        };
        
        // If we have a start time, calculate end time based on treatment duration
        if (appointmentData.startTime) {
          const startTime = new Date(appointmentData.startTime);
          const endTime = new Date(startTime.getTime() + treatment.duration * 60000); // Convert minutes to milliseconds
          updatedData.endTime = format(endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        }

        setAppointmentData((prev) => ({
          ...prev,
          ...updatedData
        }));
      }
    }

    // Calculate end time when start time changes
    if (field === 'startTime' && value && appointmentData.treatmentId) {
      const treatment = treatments.find((t) => t._id === appointmentData.treatmentId);
      if (treatment) {
        const startTime = new Date(value);
        const endTime = new Date(startTime.getTime() + treatment.duration * 60000);
        setAppointmentData((prev) => ({
          ...prev,
          endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check for scheduling conflicts
    if (conflicts.length > 0) {
      newErrors.general = 'Cannot create appointment due to scheduling conflicts';
    }

    if (patientType === 'existing' && !selectedPatientId) {
      newErrors.patient = 'Please select a patient';
    }

    if (!appointmentData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!appointmentData.treatmentId) {
      newErrors.treatmentId = 'Please select a treatment';
    }

    if (!appointmentData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!appointmentData.startTime) {
      newErrors.startTime = 'Please select start time';
    }

    if (patientType === 'new') {
      if (!newPatientData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!newPatientData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!newPatientData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newPatientData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!newPatientData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

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
                options={patients}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                value={patients.find(p => p._id === selectedPatientId) || null}
                onChange={(_, newValue) => {
                  setSelectedPatientId(newValue?._id || '');
                }}
                onInputChange={(_, value) => {
                  setSearchQuery(value);
                }}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
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
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newPatientData.lastName}
                  onChange={(e) => handleNewPatientDataChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newPatientData.email}
                  onChange={(e) => handleNewPatientDataChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newPatientData.phoneNumber}
                  onChange={(e) => handleNewPatientDataChange('phoneNumber', e.target.value)}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
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
            <FormControl fullWidth error={!!errors.doctorId}>
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
              {errors.doctorId && (
                <Typography color="error" variant="caption">
                  {errors.doctorId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.treatmentId}>
              <InputLabel>Treatment</InputLabel>
              <Select
                value={appointmentData.treatmentId}
                onChange={(e) => handleAppointmentDataChange('treatmentId', e.target.value)}
                label="Treatment"
              >
                {treatments.map((treatment) => (
                  <MenuItem key={treatment._id} value={treatment._id}>
                    <Box>
                      <Typography variant="body1">{treatment.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Duration: {treatment.duration} min • Price: ${treatment.price}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.treatmentId && (
                <FormHelperText error>{errors.treatmentId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.roomId}>
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
              {errors.roomId && (
                <Typography color="error" variant="caption">
                  {errors.roomId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={appointmentData.startTime ? new Date(appointmentData.startTime) : null}
                onChange={(date) => handleDateChange(date, 'start')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startTime,
                    helperText: errors.startTime
                  }
                }}
              />
            </LocalizationProvider>
            {isCheckingAvailability && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="caption">Checking availability...</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Time"
              value={appointmentData.endTime ? format(new Date(appointmentData.endTime), 'PPpp') : ''}
              disabled
              helperText="End time is calculated based on treatment duration"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              value={`$${appointmentData.price}`}
              disabled
              InputProps={{
                readOnly: true,
              }}
              helperText="Price is automatically set based on the selected treatment"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={appointmentData.note || ''}
              onChange={(e) => handleAppointmentDataChange('note', e.target.value)}
              placeholder="Add any special instructions or notes for this appointment"
            />
          </Grid>

          {(isCheckingConflicts || conflicts.length > 0) && (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: conflicts.length > 0 ? 'error.light' : 'background.default',
                  color: conflicts.length > 0 ? 'error.contrastText' : 'text.primary'
                }}
              >
                {isCheckingConflicts ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography>Checking for conflicts...</Typography>
                  </Box>
                ) : conflicts.length > 0 ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Scheduling Conflicts Detected
                    </Typography>
                    {conflicts.map((conflict, index) => (
                      <Box key={index} sx={{ mt: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {conflict.message}
                        </Typography>
                        <Typography variant="body2">
                          Time: {format(new Date(conflict.conflictingAppointment.startTime), 'PPpp')} - 
                          {format(new Date(conflict.conflictingAppointment.endTime), 'pp')}
                        </Typography>
                      </Box>
                    ))}
                  </>
                ) : null}
              </Paper>
            </Grid>
          )}

          {selectedPatientId && appointmentData.treatmentId && appointmentData.startTime && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Patient: {patients.find(p => p._id === selectedPatientId)?.firstName} {patients.find(p => p._id === selectedPatientId)?.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Treatment: {treatments.find(t => t._id === appointmentData.treatmentId)?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Start: {appointmentData.startTime ? format(new Date(appointmentData.startTime), 'PPpp') : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      End: {appointmentData.endTime ? format(new Date(appointmentData.endTime), 'PPpp') : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {treatments.find(t => t._id === appointmentData.treatmentId)?.duration} minutes
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCheckingConflicts || conflicts.length > 0 || loading}
        >
          {loading ? 'Creating...' : 'Create Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal;
