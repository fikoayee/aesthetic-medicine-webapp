import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as TreatmentIcon,
} from '@mui/icons-material';
import { specializationService, Specialization, CreateSpecializationDto } from '../../services/specializationService';
import { treatmentService } from '../../services/treatmentService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

interface SpecializationFormData {
  name: string;
  description: string;
}

const defaultFormData: SpecializationFormData = {
  name: '',
  description: '',
};

const Specializations = () => {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<SpecializationFormData>(defaultFormData);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const data = await specializationService.getAllSpecializations();
      console.log('Fetched specializations:', data);
      
      // Fetch treatments for each specialization
      const specializationsWithTreatments = await Promise.all(
        data.map(async (spec) => {
          const treatments = await treatmentService.getTreatmentsBySpecializationId(spec._id);
          return { ...spec, treatments };
        })
      );
      
      setSpecializations(specializationsWithTreatments);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast.error('Failed to fetch specializations');
    }
  };

  const handleOpenDialog = (specialization?: Specialization) => {
    if (specialization) {
      setSelectedSpecialization(specialization);
      setFormData({
        name: specialization.name,
        description: specialization.description,
      });
    } else {
      setSelectedSpecialization(null);
      setFormData(defaultFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSpecialization(null);
    setFormData(defaultFormData);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submitData: CreateSpecializationDto = {
        name: formData.name,
        description: formData.description,
      };

      console.log('Submitting data:', submitData);

      if (selectedSpecialization) {
        const updated = await specializationService.updateSpecialization(selectedSpecialization._id, submitData);
        console.log('Updated specialization:', updated);
        toast.success('Specialization updated successfully');
      } else {
        const created = await specializationService.createSpecialization(submitData);
        console.log('Created specialization:', created);
        toast.success('Specialization created successfully');
      }

      handleCloseDialog();
      fetchSpecializations();
    } catch (error: any) {
      console.error('Error saving specialization:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save specialization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this specialization?')) {
      try {
        await specializationService.deleteSpecialization(id);
        toast.success('Specialization deleted successfully');
        fetchSpecializations();
      } catch (error) {
        console.error('Error deleting specialization:', error);
        toast.error('Failed to delete specialization');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Specializations</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Specialization
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {specializations.map((spec) => (
          <Grid item xs={12} sm={6} md={4} key={spec._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {spec.name}
                  </Typography>
                  {isAdmin && (
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(spec)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(spec._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  {spec.description}
                </Typography>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TreatmentIcon sx={{ mr: 1 }} />
                      <Typography>
                        Treatments ({spec.treatments.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {spec.treatments.length > 0 ? (
                      <List disablePadding>
                        {spec.treatments.map((treatment, index) => (
                          <Box key={treatment._id}>
                            {index > 0 && <Divider />}
                            <ListItem disablePadding sx={{ py: 1 }}>
                              <ListItemIcon>
                                <TreatmentIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={treatment.name}
                                secondary={`${treatment.duration} min • ${treatment.price} PLN`}
                              />
                            </ListItem>
                          </Box>
                        ))}
                      </List>
                    ) : (
                      <Typography color="textSecondary">
                        No treatments assigned
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSpecialization ? 'Edit Specialization' : 'Add New Specialization'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.description}
          >
            {loading ? 'Saving...' : selectedSpecialization ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Specializations;
