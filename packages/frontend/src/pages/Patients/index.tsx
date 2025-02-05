import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Patient, Gender } from '../../types/patient';
import { patientService } from '../../services/patientService';
import PatientDialog from './PatientDialog';
import PatientDetailsDialog from './PatientDetailsDialog';

interface FilterValues {
  searchQuery: string;
  ageRange: [number, number];
  selectedGenders: Gender[];
  selectedCities: string[];
  lastVisitRange: [string, string];
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [filters, setFilters] = useState<FilterValues>({
    searchQuery: '',
    ageRange: [0, 100],
    selectedGenders: [],
    selectedCities: [],
    lastVisitRange: ['', ''],
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, filters]);

  const applyFilters = () => {
    const filtered = patients.filter(patient => {
      // Search query filter
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = filters.searchQuery === '' ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phoneNumber.toLowerCase().includes(searchLower);

      // Age filter
      const age = calculateAge(patient.birthDate);
      const matchesAge = age === 'N/A' || 
        (typeof age === 'number' && 
         age >= filters.ageRange[0] && 
         age <= filters.ageRange[1]);

      // Gender filter
      const matchesGender = filters.selectedGenders.length === 0 ||
        filters.selectedGenders.includes(patient.gender);

      // City filter
      const matchesCity = filters.selectedCities.length === 0 ||
        (patient.address && filters.selectedCities.includes(patient.address.city));

      // Last visit filter
      const matchesLastVisit = !patient.lastVisit ||
        filters.lastVisitRange[0] === '' ||
        filters.lastVisitRange[1] === '' ||
        (patient.lastVisit >= filters.lastVisitRange[0] &&
         patient.lastVisit <= filters.lastVisitRange[1]);

      return matchesSearch && matchesAge && matchesGender && 
             matchesCity && matchesLastVisit;
    });

    setFilteredPatients(filtered);
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    
    try {
      const today = new Date();
      const dateOfBirth = new Date(birthDate);
      
      if (isNaN(dateOfBirth.getTime())) {
        console.error('Invalid date:', birthDate);
        return 'N/A';
      }

      let age = today.getFullYear() - dateOfBirth.getFullYear();
      const m = today.getMonth() - dateOfBirth.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'N/A';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.error('Invalid date:', date);
        return 'N/A';
      }
      
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatAddress = (address: Patient['address']) => {
    if (!address) return 'N/A';
    return address.city || 'N/A';
  };

  const getFullAddress = (address: Patient['address']) => {
    if (!address) return 'N/A';
    const { street, city, postalCode } = address;
    return `${street}, ${postalCode} ${city}`;
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please try again later.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedPatient(undefined);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDetailsClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsDialogOpen(true);
  };

  const handleDeleteClick = async (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(patientId);
        await fetchPatients();
        setError(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
        setError('Failed to delete patient. Please try again later.');
      }
    }
  };

  const handleSave = async (patientData: Omit<Patient, '_id'>) => {
    try {
      setError(null);
      if (dialogMode === 'add') {
        await patientService.createPatient(patientData);
      } else if (selectedPatient) {
        await patientService.updatePatient(selectedPatient._id, patientData);
      }
      await fetchPatients();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to save patient. Please try again later.');
      } else {
        setError('Failed to save patient. Please try again later.');
      }
    }
  };

  return (
    <Box sx={{ 
      bgcolor: '#f3f6fb',
      height: 'calc(100vh - 64px)',
      color: '#04070b',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        display: 'flex', 
        mb: 3,
        px: 3,
        pt: 2,
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#04070b',
            borderBottom: '2px solid #306ad0',
            paddingBottom: 2,
            display: 'inline-block'
          }}
        >
          Patients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            bgcolor: '#306ad0',
            '&:hover': {
              bgcolor: '#5d91ed',
            },
            height: 'fit-content',
            paddingBlock: '8px',
            borderRadius: '8px',
            textTransform: 'none',
            boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
            marginLeft: 'auto',
          }}
        >
          Add Patient
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: 3, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ 
          mb: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
          bgcolor: '#ffffff',
        }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    color: '#04070b',
                    borderBottom: '2px solid #306ad0',
                    paddingBottom: 2,
                    display: 'inline-block'
                  }}
                >
                  <FilterListIcon sx={{ mr: 1 }} />
                  Filters
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search patients"
                  placeholder="Search by name, email, or phone"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#306ad0' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#82a8ea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#306ad0',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom sx={{ color: '#04070b', fontWeight: 500 }}>
                  Age Range
                </Typography>
                <Slider
                  value={filters.ageRange}
                  onChange={(_, newValue) => 
                    setFilters(prev => ({ ...prev, ageRange: newValue as [number, number] }))}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  sx={{
                    color: '#306ad0',
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(48, 106, 208, 0.1)',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    multiple
                    value={filters.selectedGenders}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      selectedGenders: e.target.value as Gender[]
                    }))}
                    label="Gender"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value.charAt(0).toUpperCase() + value.slice(1)}
                            sx={{
                              bgcolor: '#dddbff',
                              color: '#040316',
                              borderRadius: '6px',
                              '& .MuiChip-label': {
                                fontWeight: 500,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': {
                          borderColor: '#82a8ea',
                        },
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#306ad0',
                      },
                    }}
                  >
                    {Object.values(Gender).map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={Array.from(new Set(patients.map(p => p.address?.city).filter(Boolean)))}
                  value={filters.selectedCities}
                  onChange={(_, newValue) => {
                    setFilters(prev => ({
                      ...prev,
                      selectedCities: newValue
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cities"
                      placeholder="Select cities"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#82a8ea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#306ad0',
                          },
                        },
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        sx={{
                          bgcolor: '#dddbff',
                          color: '#040316',
                          borderRadius: '6px',
                          '& .MuiChip-label': {
                            fontWeight: 500,
                          },
                        }}
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Last Visit From"
                    type="date"
                    value={filters.lastVisitRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      lastVisitRange: [e.target.value, prev.lastVisitRange[1]]
                    }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#82a8ea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#306ad0',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Last Visit To"
                    type="date"
                    value={filters.lastVisitRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      lastVisitRange: [prev.lastVisitRange[0], e.target.value]
                    }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#82a8ea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#306ad0',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer 
          component={Paper}
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
            bgcolor: '#ffffff',
          }}
        >
          <Table>
            <TableHead>
              <TableRow >
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Date of Birth</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Address</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#04070b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: '#fbfcfe' }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress sx={{ color: '#306ad0' }} />
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7 }}>
                      No patients found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient._id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#f3f6fb',
                      },
                    }}
                  >
                    <TableCell sx={{ color: '#04070b', fontWeight: 500 }}>
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell sx={{ color: '#04070b' }}>{formatDate(patient.birthDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={calculateAge(patient.birthDate)}
                        sx={{
                          bgcolor: '#dddbff',
                          color: '#040316',
                          borderRadius: '6px',
                          '& .MuiChip-label': {
                            fontWeight: 500,
                          },
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#04070b' }}>{patient.email}</TableCell>
                    <TableCell sx={{ color: '#04070b' }}>{patient.phoneNumber}</TableCell>
                    <TableCell>
                      <Tooltip title={getFullAddress(patient.address)} arrow>
                        <Chip
                          label={formatAddress(patient.address)}
                          sx={{
                            bgcolor: '#dddbff',
                            color: '#040316',
                            borderRadius: '6px',
                            '& .MuiChip-label': {
                              fontWeight: 500,
                            },
                          }}
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleDetailsClick(patient)} 
                          size="small"
                          sx={{
                            color: '#306ad0',
                            '&:hover': {
                              bgcolor: 'rgba(48, 106, 208, 0.1)',
                            },
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleEditClick(patient)} 
                          size="small"
                          sx={{
                            color: '#306ad0',
                            '&:hover': {
                              bgcolor: 'rgba(48, 106, 208, 0.1)',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDeleteClick(patient._id)} 
                          size="small"
                          sx={{
                            color: '#ff8888',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <PatientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        mode={dialogMode}
        patient={selectedPatient}
      />

      {selectedPatient && (
        <PatientDetailsDialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          patient={selectedPatient}
        />
      )}
    </Box>
  );
};

export default Patients;
