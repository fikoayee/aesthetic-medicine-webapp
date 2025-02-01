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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { Patient } from '../../types/patient';
import { patientService } from '../../services/patientService';
import PatientDialog from './PatientDialog';
import PatientDetailsDialog from './PatientDetailsDialog';

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchPatients();
  }, []);

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Patients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No patients found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                  <TableCell>{formatDate(patient.birthDate)}</TableCell>
                  <TableCell>{calculateAge(patient.birthDate)}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phoneNumber}</TableCell>
                  <TableCell>
                    <Tooltip title={getFullAddress(patient.address)} arrow>
                      <span>{formatAddress(patient.address)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleDetailsClick(patient)} size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(patient)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(patient._id)} size="small" color="error">
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
    </Container>
  );
};

export default Patients;
