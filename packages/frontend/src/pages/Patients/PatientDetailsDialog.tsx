import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  MenuItem,
  Stack,
  Chip,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Patient } from '../../types/patient';
import { patientService } from '../../services/patientService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PatientDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

interface TreatmentHistory {
  _id: string;
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  treatment: {
    _id: string;
    name: string;
    type: string;
    description: string;
    duration: number;
    price: number;
  };
  startTime: string;
  endTime: string;
  status: 'booked' | 'ongoing' | 'canceled';
  paymentStatus: 'paid' | 'unpaid';
  note?: string;
  price: number;
}

interface ExpandableRowProps {
  appointment: TreatmentHistory;
  formatDate: (date: string | Date | null) => string;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ appointment, formatDate }) => {
  const [open, setOpen] = useState(false);
  const formattedTime = new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: open ? 'none' : 'inherit' },
          '&:hover': { backgroundColor: 'action.hover' },
          cursor: 'pointer'
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell padding="checkbox">
          <IconButton
            aria-label={open ? "collapse appointment details" : "expand appointment details"}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDate(appointment.startTime)} {formattedTime}</TableCell>
        <TableCell>{appointment.treatment.name}</TableCell>
        <TableCell>{appointment.doctor.firstName} {appointment.doctor.lastName}</TableCell>
        <TableCell>
          <Chip 
            size="small"
            label={appointment.status}
            color={appointment.status === 'booked' ? 'info' : 
                   appointment.status === 'canceled' ? 'error' : 
                   appointment.status === 'ongoing' ? 'warning' : 
                   'default'}
          />
        </TableCell>
        <TableCell align="right">${appointment.price}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              margin: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              p: 2
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Treatment Description
                  </Typography>
                  <Typography variant="body2">
                    {appointment.treatment.description || 'No description available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2">
                    {appointment.treatment.duration} minutes
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body2">
                    {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
                  </Typography>
                </Grid>
                {appointment.note && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Notes
                    </Typography>
                    <Typography variant="body2">
                      {appointment.note}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip 
                    size="small"
                    label={appointment.paymentStatus}
                    color={appointment.paymentStatus === 'paid' ? 'success' : 'warning'}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const PatientDetailsDialog: React.FC<PatientDetailsDialogProps> = ({
  open,
  onClose,
  patient,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [treatments, setTreatments] = useState<TreatmentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreatmentHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await patientService.getTreatmentHistory(patient._id);
        setTreatments(history);
      } catch (err) {
        console.error('Error fetching treatment history:', err);
        setError('Failed to load treatment history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (tabValue === 1) {
      fetchTreatmentHistory();
    }
  }, [patient._id, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange([null, null]);
  };

  const filteredTreatments = useMemo(() => {
    return treatments
      .filter(appointment => {
        const matchesSearch = searchTerm ? (
          (appointment.treatment?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (appointment.treatment?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (`${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        
        const appointmentDate = new Date(appointment.startTime);
        const matchesDateRange = 
          (!dateRange[0] || appointmentDate >= dateRange[0]) &&
          (!dateRange[1] || appointmentDate <= dateRange[1]);

        return matchesSearch && matchesDateRange;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startTime).getTime();
        const dateB = new Date(b.startTime).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [treatments, searchTerm, dateRange, sortOrder]);

  const totalSpent = treatments.reduce((sum, appointment) => sum + (appointment.price || 0), 0);
  const avgSpent = treatments.length > 0 ? totalSpent / treatments.length : 0;

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
      if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'N/A';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '80vh',
          bgcolor: '#f3f6fb',
        }
      }}
      aria-labelledby="patient-details-dialog-title"
    >
      <DialogTitle 
        id="patient-details-dialog-title"
        sx={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#04070b',
          borderBottom: '2px solid #306ad0',
          m: 2,
          pb: 2,
        }}
      >
        Patient Details: {patient.firstName} {patient.lastName}
      </DialogTitle>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="patient details tabs"
        sx={{ 
          px: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            color: '#04070b',
            opacity: 0.7,
            '&.Mui-selected': {
              color: '#306ad0',
              opacity: 1,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#306ad0',
          },
        }}
      >
        <Tab label="Overview" id="patient-tab-0" aria-controls="patient-tabpanel-0" />
        <Tab label="Appointment History" id="patient-tab-1" aria-controls="patient-tabpanel-1" />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 3,
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
                bgcolor: '#ffffff',
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: '#04070b',
                    fontWeight: 600,
                    borderBottom: '2px solid #306ad0',
                    paddingBottom: 1,
                    display: 'inline-block',
                  }}
                >
                  Personal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#04070b', fontWeight: 500 }}>
                      {patient.firstName} {patient.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#04070b', fontWeight: 500 }}>
                      {formatDate(patient.birthDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Age
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#04070b', fontWeight: 500 }}>
                      {calculateAge(patient.birthDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Gender
                    </Typography>
                    <Chip
                      label={patient.gender.toLowerCase()}
                      sx={{
                        bgcolor: '#dddbff',
                        color: '#040316',
                        borderRadius: '6px',
                        textTransform: 'capitalize',
                        '& .MuiChip-label': {
                          fontWeight: 500,
                        },
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 3,
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
                bgcolor: '#ffffff',
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: '#04070b',
                    fontWeight: 600,
                    borderBottom: '2px solid #306ad0',
                    paddingBottom: 1,
                    display: 'inline-block',
                  }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#04070b', fontWeight: 500 }}>
                      {patient.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#04070b', fontWeight: 500 }}>
                      {patient.phoneNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Address
                    </Typography>
                    <Chip
                      label={patient.address?.city || 'N/A'}
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
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
                bgcolor: '#ffffff',
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: '#04070b',
                    fontWeight: 600,
                    borderBottom: '2px solid #306ad0',
                    paddingBottom: 1,
                    display: 'inline-block',
                  }}
                >
                  Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Total Appointments
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#306ad0', fontWeight: 600 }}>
                      {treatments.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Last Visit
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#306ad0', fontWeight: 600 }}>
                      {formatDate(treatments[0]?.startTime || null)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Total Spent
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#306ad0', fontWeight: 600 }}>
                      ${totalSpent}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Average Cost
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#306ad0', fontWeight: 600 }}>
                      ${avgSpent.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress sx={{ color: '#306ad0' }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Stack spacing={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by treatment name, description or doctor..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#306ad0' }} />
                            </InputAdornment>
                          ),
                          endAdornment: searchTerm && (
                            <InputAdornment position="end">
                              <IconButton 
                                size="small" 
                                onClick={() => setSearchTerm('')}
                                aria-label="clear search"
                              >
                                <ClearIcon />
                              </IconButton>
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
                    <Grid item xs={12} sm={5}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Stack direction="row" spacing={1}>
                          <DatePicker
                            label="From"
                            value={dateRange[0]}
                            onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                      borderColor: '#82a8ea',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#306ad0',
                                    },
                                  },
                                }
                              }
                            }}
                          />
                          <DatePicker
                            label="To"
                            value={dateRange[1]}
                            onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                      borderColor: '#82a8ea',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#306ad0',
                                    },
                                  },
                                }
                              }
                            }}
                            minDate={dateRange[0] || undefined}
                          />
                        </Stack>
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                      <Tooltip title={`Sort by date (${sortOrder === 'desc' ? 'newest first' : 'oldest first'})`}>
                        <IconButton 
                          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          sx={{
                            color: '#306ad0',
                            '&:hover': {
                              bgcolor: 'rgba(48, 106, 208, 0.1)',
                            },
                          }}
                          size="large"
                          aria-label="sort by date"
                        >
                          <SortIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>

                  {(searchTerm || dateRange[0] || dateRange[1]) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7 }}>
                        Active Filters:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {searchTerm && (
                          <Chip 
                            label={`Search: ${searchTerm}`}
                            onDelete={() => setSearchTerm('')}
                            size="small"
                            sx={{
                              bgcolor: '#dddbff',
                              color: '#040316',
                              borderRadius: '6px',
                              '& .MuiChip-label': {
                                fontWeight: 500,
                              },
                            }}
                          />
                        )}
                        {(dateRange[0] || dateRange[1]) && (
                          <Chip 
                            label={`Date: ${dateRange[0] ? formatDate(dateRange[0]) : 'Start'} - ${dateRange[1] ? formatDate(dateRange[1]) : 'End'}`}
                            onDelete={() => setDateRange([null, null])}
                            size="small"
                            sx={{
                              bgcolor: '#dddbff',
                              color: '#040316',
                              borderRadius: '6px',
                              '& .MuiChip-label': {
                                fontWeight: 500,
                              },
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Typography variant="subtitle2" sx={{ color: '#04070b', opacity: 0.7 }}>
                    Showing {filteredTreatments.length} of {treatments.length} appointments
                  </Typography>
                </Stack>
              </Box>

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
                    <TableRow>
                      <TableCell style={{ width: '50px' }} />
                      <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Treatment</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Doctor</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#04070b' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#04070b' }} align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTreatments.map((appointment) => (
                      <ExpandableRow 
                        key={appointment._id}
                        appointment={appointment}
                        formatDate={formatDate}
                      />
                    ))}
                    {filteredTreatments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7 }}>
                            {treatments.length === 0 
                              ? 'No appointment history available'
                              : 'No appointments found matching your filters'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="contained"
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetailsDialog;
