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
import TreatmentTransfer from '../../components/TreatmentTransfer';

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
    <Box sx={{ 
      bgcolor: '#f3f6fb',
      height: 'calc(100vh - 64px)',
      color: '#04070b',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ display: 'flex', mb: 3 }}>
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
          Specializations
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
              height: 'fit-content',
              paddingBlock: '8px',
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
              marginLeft: 'auto',
            }}
          >
            Add Specialization
          </Button>
        )}
      </Box>

      {isAdmin && specializations.length >= 2 && (
        <Card sx={{ 
          mb: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
          bgcolor: '#ffffff',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: '#04070b',
                borderBottom: '2px solid #306ad0',
                paddingBottom: 2,
                display: 'inline-block'
              }}
            >
              Transfer Treatments
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TreatmentTransfer
                specializations={specializations}
                onTransferTreatments={async (fromSpecId, toSpecId, treatmentIds) => {
                  try {
                    const updatedSpecs = await specializationService.transferTreatments(fromSpecId, toSpecId, treatmentIds);
                    setSpecializations(prev => 
                      prev.map(spec => {
                        const updated = updatedSpecs.find(u => u._id === spec._id);
                        return updated || spec;
                      })
                    );
                    toast.success('Treatments transferred successfully');
                  } catch (error) {
                    console.error('Error transferring treatments:', error);
                    toast.error('Failed to transfer treatments');
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {specializations.map((spec) => (
            <Grid item xs={12} sm={6} md={4} key={spec._id}>
              <Card sx={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
                bgcolor: '#fbfcfe',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      component="div"
                      sx={{ 
                        fontWeight: 600,
                        color: '#04070b'
                      }}
                    >
                      {spec.name}
                    </Typography>
                    {isAdmin && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(spec)}
                          sx={{
                            color: '#306ad0',
                            '&:hover': {
                              bgcolor: 'rgba(48, 106, 208, 0.1)',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(spec._id)}
                          sx={{
                            color: '#ff8888',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Typography 
                    sx={{ 
                      mb: 2,
                      color: '#04070b',
                      opacity: 0.8
                    }}
                  >
                    {spec.description}
                  </Typography>

                  <Accordion 
                    sx={{
                      boxShadow: 'none',
                      '&:before': {
                        display: 'none',
                      },
                      bgcolor: 'transparent',
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon sx={{ color: '#306ad0' }} />}
                      sx={{
                        bgcolor: '#f3f6fb',
                        borderRadius: '8px',
                        '&:hover': {
                          bgcolor: '#e8edf5',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TreatmentIcon sx={{ mr: 1, color: '#306ad0' }} />
                        <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                          Treatments ({spec.treatments?.length || 0})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {spec.treatments?.length > 0 ? (
                        <List disablePadding>
                          {spec.treatments.map((treatment, index) => (
                            <Box key={treatment._id}>
                              {index > 0 && <Divider sx={{ borderColor: '#82a8ea', opacity: 0.2 }} />}
                              <ListItem 
                                disablePadding 
                                sx={{ 
                                  py: 1.5,
                                  borderRadius: '8px',
                                  '&:hover': {
                                    bgcolor: '#f3f6fb',
                                  },
                                }}
                              >
                                <ListItemIcon>
                                  <TreatmentIcon sx={{ color: '#306ad0' }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography sx={{ fontWeight: 500, color: '#04070b' }}>
                                      {treatment.name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                      <Chip 
                                        label={`${treatment.duration} min`}
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
                                      <Chip 
                                        label={`${treatment.price} PLN`}
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
                                    </Box>
                                  }
                                />
                              </ListItem>
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography sx={{ color: '#04070b', opacity: 0.7, py: 1 }}>
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
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedSpecialization ? 'Edit Specialization' : 'Add New Specialization'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.description}
            sx={{
              bgcolor: '#306ad0',
              '&:hover': {
                bgcolor: '#5d91ed',
              },
            }}
          >
            {loading ? 'Saving...' : selectedSpecialization ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Specializations;
