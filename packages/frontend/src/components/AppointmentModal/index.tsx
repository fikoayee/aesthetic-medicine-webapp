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
  FormLabel,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { appointmentService, AppointmentFormData, NewPatientData, AppointmentStatus, PaymentStatus } from '../../services/appointmentService';
import { Doctor } from '../../types/doctor';
import { Treatment } from '../../types/treatment';
import { Room } from '../../types/room';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data for dropdowns
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearchInput, setPatientSearchInput] = useState('');

  // State for available doctors and rooms based on treatment
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [doctorsData, treatmentsData, roomsData] = await Promise.all([
          appointmentService.getDoctors(),
          appointmentService.getTreatments(),
          appointmentService.getRooms()
        ]);

        console.log('Fetched data:', { doctorsData, treatmentsData, roomsData });
        
        if (!treatmentsData?.length) {
          console.error('No treatments data received');
          toast.error('Failed to load treatments');
          return;
        }

        setDoctors(doctorsData || []);
        setTreatments(treatmentsData);
        setRooms(roomsData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchInitialData();
    }
  }, [open]);

  useEffect(() => {
    const updateAvailability = async () => {
      if (!appointmentData.treatmentId) {
        setAvailableDoctors([]);
        setAvailableRooms([]);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching available doctors and rooms for treatment:', appointmentData.treatmentId);
        
        const [doctorsData, roomsData] = await Promise.all([
          appointmentService.getAvailableDoctorsForTreatment(appointmentData.treatmentId),
          appointmentService.getAvailableRoomsForTreatment(appointmentData.treatmentId)
        ]);

        console.log('Available data:', { doctorsData, roomsData });

        // Set available doctors
        setAvailableDoctors(doctorsData);
        setAvailableRooms(roomsData);

        // If no doctors/rooms available, show appropriate message
        if (!doctorsData.length) {
          toast.warning('No doctors available for this treatment');
        }
        if (!roomsData.length) {
          toast.warning('No rooms available for this treatment');
        }
      } catch (error) {
        console.error('Error updating availability:', error);
        toast.error('Failed to load available doctors and rooms');
      } finally {
        setLoading(false);
      }
    };

    updateAvailability();
  }, [appointmentData.treatmentId]);

  useEffect(() => {
    const searchPatients = async () => {
      if (patientType === 'existing' && patientSearchInput.trim()) {
        try {
          const results = await appointmentService.searchPatients(patientSearchInput);
          setPatients(results);
        } catch (error) {
          console.error('Error searching patients:', error);
          toast.error('Error searching for patients');
        }
      }
    };

    const timeoutId = setTimeout(searchPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [patientSearchInput, patientType]);

  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      if (selectedDate && appointmentData.doctorId) {
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          console.log('Fetching availability for date:', formattedDate);
          
          const availability = await appointmentService.getDoctorAvailability(formattedDate);
          console.log('Received availability:', availability);
          
          if (!availability || availability.length === 0) {
            toast.info('No availability found for selected date');
            return;
          }
          
          const doctorSlots = availability.find(a => a.doctorId === appointmentData.doctorId)?.availableSlots || [];
          if (doctorSlots.length === 0) {
            toast.info('No available slots for selected date');
            return;
          }

          const availableTimeSlots = doctorSlots.map(slot => slot.startTime);
          console.log('Available time slots:', availableTimeSlots);

          const selectedTreatment = treatments.find(t => t._id === appointmentData.treatmentId);
          if (!selectedTreatment) {
            console.error('Selected treatment not found');
            toast.error('Please select a valid treatment');
            return;
          }

          const treatmentDuration = selectedTreatment.duration;
          console.log('Treatment duration:', treatmentDuration);
          
          const slots: string[] = [];
          availableTimeSlots.forEach(slot => {
            try {
              const startTime = new Date(slot);
              const endTime = new Date(startTime.getTime() + treatmentDuration * 60000); // Convert minutes to milliseconds
              slots.push(startTime.toISOString());
            } catch (error) {
              console.error('Error processing time slot:', error);
            }
          });
          
          console.log('Generated available time slots:', slots);
          if (slots.length === 0) {
            toast.info('No suitable time slots found for selected treatment duration');
          }
          setAppointmentData(prev => ({
            ...prev,
            startTime: slots[0],
            endTime: new Date(new Date(slots[0]).getTime() + treatmentDuration * 60000).toISOString()
          }));
        } catch (error) {
          console.error('Error fetching doctor availability:', error);
          toast.error('Error checking doctor availability. Please try again.');
        }
      }
    };

    fetchDoctorAvailability();
  }, [selectedDate, appointmentData.doctorId, treatments]);

  useEffect(() => {
    const checkConflicts = async () => {
      try {
        if (
          appointmentData.doctorId &&
          appointmentData.roomId &&
          appointmentData.startTime &&
          appointmentData.endTime &&
          (patientType === 'existing' ? selectedPatient?._id : true)
        ) {
          const conflicts = await appointmentService.checkForConflicts(
            appointmentData.doctorId,
            appointmentData.roomId,
            patientType === 'existing' ? selectedPatient?._id : '',
            appointmentData.startTime,
            appointmentData.endTime
          );
          if (conflicts.length > 0) {
            toast.error('Time slot conflicts detected');
          }
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    };
    checkConflicts();
  }, [
    appointmentData.doctorId,
    appointmentData.roomId,
    appointmentData.startTime,
    appointmentData.endTime,
    selectedPatient,
    patientType
  ]);

  useEffect(() => {
    const clearDoctorAndRoomSelection = () => {
      if (appointmentData.treatmentId) {
        setAppointmentData(prev => ({
          ...prev,
          doctorId: '',
          roomId: ''
        }));
      }
    };

    clearDoctorAndRoomSelection();
  }, [appointmentData.treatmentId]);

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

  const handleDateSelection = (date: Date | null) => {
    setSelectedDate(date);
    setAppointmentData(prev => ({
      ...prev,
      startTime: '',
      endTime: ''
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check for scheduling conflicts
    if (appointmentData.doctorId && appointmentData.roomId && appointmentData.startTime && appointmentData.endTime) {
      try {
        const conflicts = appointmentService.checkForConflicts(
          appointmentData.doctorId,
          appointmentData.roomId,
          patientType === 'existing' ? selectedPatient?._id : '',
          appointmentData.startTime,
          appointmentData.endTime
        );
        if (conflicts.length > 0) {
          newErrors.general = 'Cannot create appointment due to scheduling conflicts';
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    }

    if (patientType === 'existing' && !selectedPatient?._id) {
      newErrors.patientId = 'Please select a patient';
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Get the treatment price
      const selectedTreatment = treatments.find(t => t._id === appointmentData.treatmentId);
      if (!selectedTreatment) {
        throw new Error('Selected treatment not found');
      }

      console.log('Selected treatment:', selectedTreatment);

      const appointmentDataWithPrice = {
        ...appointmentData,
        price: selectedTreatment.price,
        status: AppointmentStatus.BOOKED,
        paymentStatus: PaymentStatus.UNPAID
      };

      console.log('Appointment data with price:', appointmentDataWithPrice);

      const createData = patientType === 'existing'
        ? {
            patientId: selectedPatient?._id,
            appointment: appointmentDataWithPrice
          }
        : {
            newPatient: newPatientData,
            appointment: appointmentDataWithPrice
          };

      console.log('Final create data:', createData);

      await appointmentService.createAppointment(createData);
      toast.success('Appointment created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setPatientSearchInput(query);
    
    if (query.trim()) {
      try {
        const results = await appointmentService.searchPatients(query);
        setPatients(results);
      } catch (error) {
        console.error('Error searching patients:', error);
        toast.error('Error searching for patients');
      }
    } else {
      setPatients([]);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchInput(`${patient.firstName} ${patient.lastName}`);
    setPatients([]);
  };

  useEffect(() => {
    if (patientType === 'new') {
      setSelectedPatient(null);
      setPatientSearchInput('');
      setPatients([]);
    }
  }, [patientType]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        Create New Appointment
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Patient Information
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Patient Type</FormLabel>
              <RadioGroup
                row
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as 'new' | 'existing')}
              >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Existing Patient"
                />
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="New Patient"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {patientType === 'existing' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Patients"
                value={patientSearchInput}
                onChange={handleSearchChange}
              />
              {patients.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto', width: '100%' }}>
                  <List>
                    {patients.map((patient) => (
                      <ListItem
                        key={patient._id}
                        button
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <ListItemText
                          primary={`${patient.firstName} ${patient.lastName}`}
                          secondary={`${patient.email} • ${patient.phoneNumber}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              {selectedPatient && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, width: '100%' }}>
                  <Typography variant="subtitle2">Selected Patient:</Typography>
                  <Typography>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.email} • {selectedPatient.phoneNumber}
                  </Typography>
                </Box>
              )}
            </Grid>
          )}
          {patientType === 'new' && (
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

          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  setAppointmentData(prev => ({
                    ...prev,
                    startTime: '',
                    endTime: ''
                  }));
                }}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Treatment</InputLabel>
              <Select
                value={appointmentData.treatmentId}
                onChange={(e) => handleAppointmentDataChange('treatmentId', e.target.value)}
                label="Treatment"
                disabled={loading}
              >
                {treatments.map((treatment) => (
                  <MenuItem key={treatment._id} value={treatment._id}>
                    <Box>
                      <Typography>{treatment.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duration: {treatment.duration} min | Price: ${treatment.price}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={appointmentData.doctorId}
                onChange={(e) => handleAppointmentDataChange('doctorId', e.target.value)}
                label="Doctor"
                disabled={!appointmentData.treatmentId || loading}
              >
                {doctors?.map((doctor) => (
                  <MenuItem 
                    key={doctor._id} 
                    value={doctor._id}
                    disabled={!availableDoctors.some(d => d._id === doctor._id)}
                  >
                    <Box>
                      <Typography>
                        Dr. {doctor.firstName} {doctor.lastName}
                        {!availableDoctors.some(d => d._id === doctor._id) && ' (Not available)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doctor.specializations?.map(s => s.name).join(', ')}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Room</InputLabel>
              <Select
                value={appointmentData.roomId}
                onChange={(e) => handleAppointmentDataChange('roomId', e.target.value)}
                label="Room"
                disabled={!appointmentData.treatmentId || loading}
              >
                {rooms?.map((room) => (
                  <MenuItem 
                    key={room._id} 
                    value={room._id}
                    disabled={!availableRooms.some(r => r._id === room._id)}
                  >
                    <Box>
                      <Typography>
                        {room.name}
                        {!availableRooms.some(r => r._id === room._id) && ' (Not available)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {room.specializations?.map(s => s.name).join(', ')}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              value={appointmentData.startTime ? format(new Date(appointmentData.startTime), 'PPpp') : ''}
              disabled
            />
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

          {selectedPatient && appointmentData.treatmentId && appointmentData.startTime && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.paper', width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Patient</Typography>
                    {patientType === 'existing' && selectedPatient ? (
                      <>
                        <Typography>
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedPatient.email} • {selectedPatient.phoneNumber}
                        </Typography>
                      </>
                    ) : patientType === 'new' ? (
                      <>
                        <Typography>
                          {newPatientData.firstName} {newPatientData.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {newPatientData.email} • {newPatientData.phoneNumber}
                        </Typography>
                      </>
                    ) : (
                      <Typography color="text.secondary">No patient selected</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Doctor</Typography>
                    {appointmentData.doctorId ? (
                      <Typography>
                        {doctors.find(d => d._id === appointmentData.doctorId)?.firstName}{' '}
                        {doctors.find(d => d._id === appointmentData.doctorId)?.lastName}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">No doctor selected</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Treatment</Typography>
                    {appointmentData.treatmentId ? (
                      <>
                        <Typography>
                          {treatments.find(t => t._id === appointmentData.treatmentId)?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {treatments.find(t => t._id === appointmentData.treatmentId)?.duration} minutes
                        </Typography>
                      </>
                    ) : (
                      <Typography color="text.secondary">No treatment selected</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Room</Typography>
                    {appointmentData.roomId ? (
                      <Typography>
                        {rooms.find(r => r._id === appointmentData.roomId)?.name}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">No room selected</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Date & Time</Typography>
                    {appointmentData.startTime ? (
                      <>
                        <Typography>
                          {format(new Date(appointmentData.startTime), 'PPP')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(appointmentData.startTime), 'p')} - {format(new Date(appointmentData.endTime), 'p')}
                        </Typography>
                      </>
                    ) : (
                      <Typography color="text.secondary">No time selected</Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          Create Appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal;
