import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Slider,
  FormGroup,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Treatment, treatmentService, CreateTreatmentData } from '../../services/treatmentService';
import { Specialization, specializationService } from '../../services/specializationService';
import { useAuth } from '../../contexts/AuthContext';

interface TreatmentFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: string;
}

interface FilterValues {
  priceRange: [number, number];
  durationRange: [number, number];
  selectedSpecializations: string[];
  searchQuery: string;
  selectedDurationSlots: number[];
}

const DURATION_SLOTS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: 'hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const Treatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [formData, setFormData] = useState<TreatmentFormData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    specialization: '',
  });

  const [filters, setFilters] = useState<FilterValues>({
    priceRange: [0, 1000],
    durationRange: [0, 120],
    selectedSpecializations: [],
    searchQuery: '',
    selectedDurationSlots: [],
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([fetchTreatments(), fetchSpecializations()]);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [treatments, filters]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const fetchedTreatments = await treatmentService.getAllTreatments();
      setTreatments(fetchedTreatments);
      setFilteredTreatments(fetchedTreatments);
      
      // Update price and duration ranges based on actual data
      const maxPrice = Math.max(...fetchedTreatments.map(t => t.price));
      const maxDuration = Math.max(...fetchedTreatments.map(t => t.duration));
      setFilters(prev => ({
        ...prev,
        priceRange: [0, maxPrice],
        durationRange: [0, maxDuration],
      }));
      
      setError('');
    } catch (err) {
      setError('Failed to fetch treatments');
      console.error('Error fetching treatments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const fetchedSpecializations = await specializationService.getAllSpecializations();
      setSpecializations(fetchedSpecializations);
    } catch (err) {
      console.error('Error fetching specializations:', err);
      setError('Failed to fetch specializations');
    }
  };

  const applyFilters = () => {
    const filtered = treatments.filter(treatment => {
      const matchesPrice = treatment.price >= filters.priceRange[0] && 
                          treatment.price <= filters.priceRange[1];
      
      const matchesDuration = treatment.duration >= filters.durationRange[0] && 
                             treatment.duration <= filters.durationRange[1];

      const matchesDurationSlots = filters.selectedDurationSlots.length === 0 ||
                                 filters.selectedDurationSlots.includes(treatment.duration);
      
      const matchesSpecialization = filters.selectedSpecializations.length === 0 || 
                                  filters.selectedSpecializations.includes(treatment.specialization._id);

      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = filters.searchQuery === '' ||
                          treatment.name.toLowerCase().includes(searchLower) ||
                          treatment.description.toLowerCase().includes(searchLower);
      
      return matchesPrice && matchesDuration && matchesSpecialization && matchesSearch && matchesDurationSlots;
    });

    setFilteredTreatments(filtered);
  };

  const handleOpenDialog = (treatment?: Treatment) => {
    if (treatment) {
      setSelectedTreatment(treatment);
      setFormData({
        name: treatment.name,
        description: treatment.description,
        duration: treatment.duration,
        price: treatment.price,
        specialization: treatment.specialization._id,
      });
    } else {
      setSelectedTreatment(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        specialization: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTreatment(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      specialization: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const treatmentData: CreateTreatmentData = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        specialization: formData.specialization,
      };

      if (selectedTreatment) {
        await treatmentService.updateTreatment(selectedTreatment._id, treatmentData);
      } else {
        await treatmentService.createTreatment(treatmentData);
      }
      handleCloseDialog();
      fetchTreatments();
    } catch (err) {
      console.error('Error saving treatment:', err);
      setError('Failed to save treatment');
    }
  };

  const handleDelete = async (treatmentId: string) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await treatmentService.deleteTreatment(treatmentId);
        fetchTreatments();
      } catch (err) {
        console.error('Error deleting treatment:', err);
        setError('Failed to delete treatment');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading treatments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Treatments
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Treatment
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FilterListIcon sx={{ mr: 1 }} />
                Filters
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search treatments"
                placeholder="Search by name or description"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Price Range (PLN)</Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, newValue) => 
                  setFilters(prev => ({ ...prev, priceRange: newValue as [number, number] }))}
                valueLabelDisplay="auto"
                min={0}
                max={Math.max(...treatments.map(t => t.price))}
                valueLabelFormat={value => formatPrice(value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Duration Range (minutes)</Typography>
              <Slider
                value={filters.durationRange}
                onChange={(_, newValue) => 
                  setFilters(prev => ({ ...prev, durationRange: newValue as [number, number] }))}
                valueLabelDisplay="auto"
                min={0}
                max={Math.max(...treatments.map(t => t.duration))}
                valueLabelFormat={value => `${value} min`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={specializations}
                getOptionLabel={(option) => option.name}
                value={specializations.filter(spec => 
                  filters.selectedSpecializations.includes(spec._id))}
                onChange={(_, newValue) => {
                  setFilters(prev => ({
                    ...prev,
                    selectedSpecializations: newValue.map(spec => spec._id)
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Specializations"
                    placeholder="Select specializations"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Duration</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {DURATION_SLOTS.map((slot) => (
                  <Chip
                    key={slot.value}
                    label={slot.label}
                    onClick={() => {
                      setFilters(prev => {
                        const newSlots = prev.selectedDurationSlots.includes(slot.value)
                          ? prev.selectedDurationSlots.filter(v => v !== slot.value)
                          : [...prev.selectedDurationSlots, slot.value];
                        return { ...prev, selectedDurationSlots: newSlots };
                      });
                    }}
                    color={filters.selectedDurationSlots.includes(slot.value) ? "primary" : "default"}
                    variant={filters.selectedDurationSlots.includes(slot.value) ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell align="right">Duration (min)</TableCell>
              <TableCell align="right">Price</TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTreatments.map((treatment) => (
              <TableRow key={treatment._id}>
                <TableCell component="th" scope="row">
                  {treatment.name}
                </TableCell>
                <TableCell>{treatment.description}</TableCell>
                <TableCell>
                  <Chip
                    label={treatment.specialization.name}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{treatment.duration}</TableCell>
                <TableCell align="right">{formatPrice(treatment.price)}</TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(treatment)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(treatment._id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTreatment ? 'Edit Treatment' : 'Add New Treatment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Treatment Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                label="Specialization"
              >
                {specializations.map((spec) => (
                  <MenuItem key={spec._id} value={spec._id}>
                    {spec.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Duration"
              type="number"
              fullWidth
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
              }}
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">PLN</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.specialization ||
              formData.duration < 1 ||
              formData.price < 0
            }
          >
            {selectedTreatment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Treatments;
