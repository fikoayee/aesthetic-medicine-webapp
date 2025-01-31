import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as TreatmentIcon,
} from '@mui/icons-material';
import { Room, roomService } from '../../services/roomService';
import { Specialization, specializationService } from '../../services/specializationService';
import { useAuth } from '../../contexts/AuthContext';

interface RoomFormData {
  name: string;
  description: string;
  specializations: string[];
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    specializations: [],
  });
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([fetchRooms(), fetchSpecializations()]);
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const fetchedRooms = await roomService.getAllRooms();
      setRooms(fetchedRooms);
      setError('');
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error('Error fetching rooms:', err);
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

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setSelectedRoom(room);
      setFormData({
        name: room.name,
        description: room.description,
        specializations: room.specializations.map(spec => spec._id),
      });
    } else {
      setSelectedRoom(null);
      setFormData({
        name: '',
        description: '',
        specializations: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoom(null);
    setFormData({
      name: '',
      description: '',
      specializations: [],
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedRoom) {
        await roomService.updateRoom(selectedRoom._id, formData);
      } else {
        await roomService.createRoom(formData);
      }
      handleCloseDialog();
      fetchRooms();
    } catch (err) {
      console.error('Error saving room:', err);
      setError('Failed to save room');
    }
  };

  const handleDelete = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(roomId);
        fetchRooms();
      } catch (err) {
        console.error('Error deleting room:', err);
        setError('Failed to delete room');
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
        <Typography>Loading rooms...</Typography>
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
          Treatment Rooms
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Room
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h2">
                    {room.name}
                  </Typography>
                  {isAdmin && (
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(room)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(room._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography color="textSecondary" sx={{ mb: 1.5 }}>
                  {room.description}
                </Typography>
                
                {room.specializations.map((spec) => (
                  <Accordion key={spec._id} sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={spec.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {spec.treatments?.length || 0} treatments
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense disablePadding>
                        {spec.treatments?.map((treatment) => (
                          <ListItem key={treatment._id} sx={{ px: 0 }}>
                            <ListItemText
                              primary={treatment.name}
                              secondary={
                                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption">
                                    {treatment.duration} min
                                  </Typography>
                                  <Typography variant="caption" color="primary">
                                    {formatPrice(treatment.price)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRoom ? 'Edit Room' : 'Add New Room'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Name"
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
              <InputLabel>Specializations</InputLabel>
              <Select
                multiple
                value={formData.specializations}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specializations: typeof e.target.value === 'string' 
                    ? [e.target.value] 
                    : e.target.value 
                })}
                label="Specializations"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const spec = specializations.find(s => s._id === value);
                      return spec ? (
                        <Chip key={value} label={spec.name} size="small" />
                      ) : null;
                    })}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.description || formData.specializations.length === 0}
          >
            {selectedRoom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
