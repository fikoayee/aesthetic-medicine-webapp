import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { Patient, Address } from '../../types/patient';

interface PatientDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, '_id'>) => void;
  patient?: Patient;
  mode: 'add' | 'edit';
}

const PatientDialog: React.FC<PatientDialogProps> = ({
  open,
  onClose,
  onSave,
  patient,
  mode,
}) => {
  const defaultPatient: Omit<Patient, '_id'> = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    birthDate: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
    },
  };

  const [formData, setFormData] = useState(defaultPatient);

  useEffect(() => {
    if (patient && mode === 'edit') {
      const { _id, ...patientData } = patient;
      // Format date for the date input
      if (patientData.birthDate) {
        try {
          const date = new Date(patientData.birthDate);
          if (!isNaN(date.getTime())) {
            patientData.birthDate = date.toISOString().split('T')[0];
          } else {
            patientData.birthDate = '';
          }
        } catch (error) {
          console.error('Error formatting date:', error);
          patientData.birthDate = '';
        }
      }
      setFormData(patientData);
    } else {
      setFormData(defaultPatient);
    }
  }, [patient, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format the date to ISO string before sending
    const formattedData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate + 'T00:00:00Z').toISOString() : '',
    };
    onSave(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New Patient' : 'Edit Patient'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                select
                value={formData.gender}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthDate"
                label="Date of Birth"
                type="date"
                value={formData.birthDate || ''}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address.street"
                label="Street Address"
                value={formData.address.street}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address.city"
                label="City"
                value={formData.address.city}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address.postalCode"
                label="Postal Code"
                value={formData.address.postalCode}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PatientDialog;
