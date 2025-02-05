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
  InputAdornment,
  alpha,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocalHospital as LocalHospitalIcon, 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  AccessTime, 
  Search as SearchIcon 
} from '@mui/icons-material';
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
      // Convert working days data to the expected format
      const workingDays = doctor.workingDays instanceof Map 
        ? Object.fromEntries(doctor.workingDays)
        : typeof doctor.workingDays === 'object' && doctor.workingDays !== null
          ? doctor.workingDays
          : defaultWorkingDays;
        
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        specializations: doctor.specializations.map(s => s._id),
        workingDays,
        workingDaysExceptions: doctor.workingDaysExceptions || [],
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
      // Convert working days to the expected format
      const submissionData = {
        ...formData,
        workingDays: Object.fromEntries(
          Object.entries(formData.workingDays).map(([day, data]) => [
            day,
            {
              isWorking: data.isWorking || false,
              hours: data.isWorking ? {
                start: data.hours?.start || '09:00',
                end: data.hours?.end || '17:00'
              } : undefined
            }
          ])
        )
      };

      if (selectedDoctor) {
        await doctorService.updateDoctor(selectedDoctor._id, submissionData);
        toast.success('Doctor updated successfully');
      } else {
        await doctorService.createDoctor(submissionData);
        toast.success('Doctor created successfully');
      }
      handleCloseDialog();
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      if (error instanceof Error) {
        toast.error(`Failed to ${selectedDoctor ? 'update' : 'create'} doctor: ${error.message}`);
      } else {
        toast.error(`Failed to ${selectedDoctor ? 'update' : 'create'} doctor`);
      }
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
          isWorking: true,
          hours: {
            ...prev.workingDays[day]?.hours,
            [field]: value
          }
        }
      }
    }));
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f3f6fb', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#04070b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocalHospitalIcon sx={{ color: '#306ad0' }} />
          Doctors
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#306ad0',
              '&:hover': {
                bgcolor: '#5d91ed',
              },
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
            }}
          >
            Add Doctor
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
      }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: '#82a8ea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#306ad0' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Specializations</InputLabel>
            <Select
              multiple
              value={selectedSpecializations}
              onChange={(e) => setSelectedSpecializations(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Specializations"
              sx={{
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: '#82a8ea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={specializations.find(s => s._id === value)?.name}
                      size="small"
                      sx={{
                        borderRadius: '6px',
                        bgcolor: alpha('#306ad0', 0.1),
                        color: '#306ad0',
                        fontWeight: 500,
                      }}
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

          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Working Days</InputLabel>
            <Select
              multiple
              value={selectedDays}
              onChange={(e) => setSelectedDays(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              label="Working Days"
              sx={{
                borderRadius: '8px',
                '&:hover fieldset': {
                  borderColor: '#82a8ea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((day) => (
                    <Chip
                      key={day}
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      size="small"
                      sx={{
                        borderRadius: '6px',
                        bgcolor: alpha('#306ad0', 0.1),
                        color: '#306ad0',
                        fontWeight: 500,
                      }}
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

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          '& .MuiTableCell-root': {
            borderColor: 'rgba(0,0,0,0.05)',
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              bgcolor: '#f8fafd',
              '& th': { 
                fontWeight: 600,
                color: '#04070b',
                py: 2,
              },
            }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" sx={{ color: '#306ad0' }} />
                  Name
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" sx={{ color: '#306ad0' }} />
                  Email
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ color: '#306ad0' }} />
                  Phone
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon fontSize="small" sx={{ color: '#306ad0' }} />
                  Specializations
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" sx={{ color: '#306ad0' }} />
                  Working Days
                </Box>
              </TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoctors.map((doctor) => (
              <TableRow 
                key={doctor._id}
                hover
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#306ad0', 0.04),
                  },
                }}
                onClick={() => handleOpenDialog(doctor)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                    {`${doctor.firstName} ${doctor.lastName}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#04070b' }}>
                    {doctor.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#04070b' }}>
                    {doctor.phoneNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {doctor.specializations.map((spec) => (
                      <Chip
                        key={spec._id}
                        label={spec.name}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          bgcolor: alpha('#306ad0', 0.1),
                          color: '#306ad0',
                          fontWeight: 500,
                          border: 'none',
                        }}
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
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                bgcolor: alpha('#306ad0', 0.95),
                                borderRadius: '8px',
                                p: 1,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              },
                              '& .MuiTooltip-arrow': {
                                color: alpha('#306ad0', 0.95),
                              },
                            },
                          }}
                        >
                          <Chip
                            label={DAY_ABBREVIATIONS[day]}
                            size="small"
                            sx={{
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              backgroundColor: workingDay?.isWorking ? alpha('#306ad0', 0.1) : 'rgba(0,0,0,0.05)',
                              color: workingDay?.isWorking ? '#306ad0' : '#666',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              '&:hover': {
                                backgroundColor: workingDay?.isWorking ? alpha('#306ad0', 0.15) : 'rgba(0,0,0,0.08)',
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
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: 'flex-end',
                    }}>
                      <Tooltip title="Edit Doctor">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(doctor);
                          }}
                          sx={{
                            color: '#306ad0',
                            '&:hover': {
                              bgcolor: alpha('#306ad0', 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Doctor">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doctor._id);
                          }}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              bgcolor: alpha('#d32f2f', 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            bgcolor: '#f3f6fb',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '2px solid #306ad0',
          m: 2,
          pb: 2,
          color: '#04070b',
          fontWeight: 600,
        }}>
          <LocalHospitalIcon sx={{ color: '#306ad0' }} />
          {selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            pt: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5 
          }}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
              <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
              <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
              <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                Specializations
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Specializations</InputLabel>
                <Select
                  multiple
                  value={formData.specializations}
                  onChange={handleSpecializationChange}
                  label="Select Specializations"
                  sx={{
                    borderRadius: '8px',
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={specializations.find(s => s._id === value)?.name}
                          size="small"
                          sx={{
                            borderRadius: '6px',
                            bgcolor: alpha('#306ad0', 0.1),
                            color: '#306ad0',
                            fontWeight: 500,
                          }}
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
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
              <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                Working Hours
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {DAYS_OF_WEEK.map((day) => (
                  <Box key={day} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: formData.workingDays[day]?.isWorking ? alpha('#306ad0', 0.04) : 'transparent',
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.workingDays[day]?.isWorking || false}
                          onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#306ad0',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#306ad0',
                            },
                          }}
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
                          sx={{ 
                            width: 150,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                        <TextField
                          label="End Time"
                          type="time"
                          value={formData.workingDays[day]?.hours?.end || '17:00'}
                          onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          sx={{ 
                            width: 150,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)',
              },
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Cancel
          </Button>
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
            sx={{
              bgcolor: '#306ad0',
              '&:hover': {
                bgcolor: '#5d91ed',
              },
              '&.Mui-disabled': {
                bgcolor: alpha('#306ad0', 0.4),
              },
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
            }}
          >
            {selectedDoctor ? 'Update Doctor' : 'Add Doctor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;
