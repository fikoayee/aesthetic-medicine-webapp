import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Doctor, DoctorFormData, doctorService } from '../../services/doctorService';
import { Specialization, specializationService } from '../../services/specializationService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const;

const DAY_ABBREVIATIONS = {
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'Th',
  friday: 'F',
  saturday: 'S'
} as const;

const defaultWorkingDays = {
  monday: { isWorking: true, hours: { start: '09:00', end: '17:00' } },
  tuesday: { isWorking: true, hours: { start: '09:00', end: '17:00' } },
  wednesday: { isWorking: true, hours: { start: '09:00', end: '17:00' } },
  thursday: { isWorking: true, hours: { start: '09:00', end: '17:00' } },
  friday: { isWorking: true, hours: { start: '09:00', end: '17:00' } },
  saturday: { isWorking: false },
};

const defaultFormData: DoctorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  specializations: [],
  workingDays: defaultWorkingDays,
  workingDaysExceptions: [],
};

const formatDayLabel = (day: string, workingDay?: { isWorking: boolean; hours?: { start: string; end: string } }) => {
  if (!workingDay?.isWorking) {
    return `${day.charAt(0).toUpperCase() + day.slice(1)}: Not Working`;
  }
  return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${workingDay.hours?.start} - ${workingDay.hours?.end}`;
};

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>(defaultFormData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecializations, selectedDays]);

  const filterDoctors = () => {
    console.log('Starting filterDoctors with doctors:', doctors);
    
    if (!Array.isArray(doctors)) {
      console.error('Doctors data is not in the expected format');
      return;
    }

    let filtered = [...doctors];
    console.log('Initial filtered array:', filtered);

    // Filter by search query (name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doctor => 
          doctor.firstName.toLowerCase().includes(query) ||
          doctor.lastName.toLowerCase().includes(query)
      );
      console.log('After name filter:', filtered);
    }

    // Filter by specializations
    if (selectedSpecializations.length > 0) {
      console.log('Selected specializations:', selectedSpecializations);
      filtered = filtered.filter(doctor =>
        doctor.specializations.some(spec => 
          selectedSpecializations.includes(spec._id)
        )
      );
      console.log('After specialization filter:', filtered);
    }

    // Filter by working days
    if (selectedDays.length > 0) {
      console.log('Selected days:', selectedDays);
      filtered = filtered.filter(doctor => 
        selectedDays.every(day => {
          const workingDays = doctor.workingDays;
          console.log('Working days for doctor:', doctor.firstName, workingDays);
          const workingDay = workingDays instanceof Map
            ? workingDays.get(day)
            : workingDays[day];
          console.log('Working day for', day, ':', workingDay);
          return workingDay?.isWorking ?? false;
        })
      );
      console.log('After working days filter:', filtered);
    }

    console.log('Final filtered doctors:', filtered);
    setFilteredDoctors(filtered);
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors();
      console.log('Raw doctors data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected doctors data to be an array');
        return;
      }

      // Convert workingDays to the expected format if needed
      const formattedData = data.map(doctor => {
        console.log('Processing doctor:', doctor);
        const formattedDoctor = {
          ...doctor,
          workingDays: doctor.workingDays instanceof Map 
            ? doctor.workingDays 
            : typeof doctor.workingDays === 'object' && doctor.workingDays !== null
              ? new Map(Object.entries(doctor.workingDays))
              : new Map()
        };
        console.log('Formatted doctor:', formattedDoctor);
        return formattedDoctor;
      });
      
      console.log('Formatted doctors data:', formattedData);
      setDoctors(formattedData);
      setFilteredDoctors(formattedData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const data = await specializationService.getAllSpecializations();
      setSpecializations(data);
    } catch (error) {
      toast.error('Failed to fetch specializations');
      console.error('Error fetching specializations:', error);
    }
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      // Convert Map to regular object if it's a Map, otherwise use as is
      const workingDays = doctor.workingDays instanceof Map 
        ? Object.fromEntries(doctor.workingDays)
        : doctor.workingDays;
        
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        specializations: doctor.specializations.map(s => s._id),
        workingDays,
        workingDaysExceptions: doctor.workingDaysExceptions,
      });
    } else {
      setSelectedDoctor(null);
      setFormData(defaultFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoctor(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async () => {
    try {
      if (selectedDoctor) {
        await doctorService.updateDoctor(selectedDoctor._id, formData);
        toast.success('Doctor updated successfully');
      } else {
        await doctorService.createDoctor(formData);
        toast.success('Doctor created successfully');
      }
      handleCloseDialog();
      fetchDoctors();
    } catch (error) {
      toast.error(selectedDoctor ? 'Failed to update doctor' : 'Failed to create doctor');
      console.error('Error saving doctor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        toast.error('Failed to delete doctor');
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleSpecializationChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      specializations: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleWorkingDayChange = (day: string, isWorking: boolean) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: {
          ...prev.workingDays[day],
          isWorking,
          hours: isWorking 
            ? prev.workingDays[day]?.hours || { start: '09:00', end: '17:00' }
            : undefined
        }
      }
    }));
  };

  const handleWorkingHoursChange = (day: string, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: {
          ...prev.workingDays[day],
          hours: {
            ...prev.workingDays[day]?.hours,
            [field]: value
          }
        }
      }
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Doctors</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Doctor
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Specializations</InputLabel>
            <Select
              multiple
              value={selectedSpecializations}
              onChange={(e) => setSelectedSpecializations(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Specializations"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={specializations.find(s => s._id === value)?.name}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {specializations.map((spec) => (
                <MenuItem key={spec._id} value={spec._id}>
                  {spec.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Working Days</InputLabel>
            <Select
              multiple
              value={selectedDays}
              onChange={(e) => setSelectedDays(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Working Days"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((day) => (
                    <Chip
                      key={day}
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Specializations</TableCell>
              <TableCell>Working Days</TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoctors.map((doctor) => (
              <TableRow key={doctor._id}>
                <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>{doctor.phoneNumber}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {doctor.specializations.map((spec) => (
                      <Chip
                        key={spec._id}
                        label={spec.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {DAYS_OF_WEEK.map((day) => {
                      const workingDay = doctor.workingDays instanceof Map 
                        ? doctor.workingDays.get(day)
                        : doctor.workingDays[day];
                      return (
                        <Tooltip 
                          key={day}
                          title={formatDayLabel(day, workingDay)}
                          arrow
                        >
                          <Chip
                            label={DAY_ABBREVIATIONS[day]}
                            size="small"
                            sx={{
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              backgroundColor: workingDay?.isWorking ? 'primary.main' : 'grey.300',
                              color: workingDay?.isWorking ? 'white' : 'text.secondary',
                              '&:hover': {
                                backgroundColor: workingDay?.isWorking ? 'primary.dark' : 'grey.400',
                              }
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(doctor)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(doctor._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Specializations</InputLabel>
              <Select
                multiple
                value={formData.specializations}
                onChange={handleSpecializationChange}
                label="Specializations"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={specializations.find(s => s._id === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec._id} value={spec._id}>
                    {spec.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2 }}>Working Hours</Typography>
            {DAYS_OF_WEEK.map((day) => (
              <Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.workingDays[day]?.isWorking || false}
                      onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                    />
                  }
                  label={day.charAt(0).toUpperCase() + day.slice(1)}
                  sx={{ width: 150 }}
                />
                {formData.workingDays[day]?.isWorking && (
                  <>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={formData.workingDays[day]?.hours?.start || '09:00'}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      sx={{ width: 150 }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={formData.workingDays[day]?.hours?.end || '17:00'}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      sx={{ width: 150 }}
                    />
                  </>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.phoneNumber ||
              formData.specializations.length === 0
            }
          >
            {selectedDoctor ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;
