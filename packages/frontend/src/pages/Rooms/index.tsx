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
  ListItemIcon,
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
import { toast } from 'react-toastify';

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
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [roomSpecializations, setRoomSpecializations] = useState<{ [key: string]: Specialization[] }>({});
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
    } catch (err) {
      toast.error('Failed to fetch rooms');
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
      toast.error('Failed to fetch specializations');
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
        toast.success('Room updated successfully');
      } else {
        await roomService.createRoom(formData);
        toast.success('Room created successfully');
      }
      handleCloseDialog();
      fetchRooms();
    } catch (err) {
      console.error('Error saving room:', err);
      toast.error(selectedRoom ? 'Failed to update room' : 'Failed to create room');
    }
  };

  const handleDelete = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(roomId);
        toast.success('Room deleted successfully');
        fetchRooms();
      } catch (err) {
        console.error('Error deleting room:', err);
        toast.error('Failed to delete room');
      }
    }
  };

  const handleAccordionChange = async (roomId: string) => {
    if (expandedRoom !== roomId) {
      setExpandedRoom(roomId);
      if (!roomSpecializations[roomId]) {
        try {
          const specializations = await roomService.getRoomSpecializations(roomId);
          setRoomSpecializations(prev => ({
            ...prev,
            [roomId]: specializations
          }));
        } catch (error) {
          console.error('Error fetching room specializations:', error);
          toast.error('Failed to load specializations');
        }
      }
    } else {
      setExpandedRoom(null);
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
    <Box sx={{ 
      bgcolor: '#f3f6fb',
      height: 'calc(100vh - 64px)',  
      color: '#04070b',
      overflowY: 'auto', 
    }}>
     

      <Box sx={{display: 'flex'}}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          fontWeight: 600,
          color: '#04070b',
          borderBottom: '2px solid #306ad0',
          paddingBottom: 2,
          display: 'inline-block'
        }}
      >
        Treatment Rooms
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
          Add New Room
        </Button>
      )}
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} md={6} lg={4} key={room._id}>
            <Card 
              sx={{
                height: '100%',
                borderRadius: '12px',
                border: '1px solid #82a8ea',
                boxShadow: '0 4px 12px rgba(4, 7, 11, 0.05)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(4, 7, 11, 0.1)',
                },
                bgcolor: '#f3f6fb',
              }}
            >
              <CardContent sx={{ p: 3, backgroundColor: '#fbfbfe' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#04070b',
                      mb: 1
                    }}
                  >
                    {room.name}
                  </Typography>
                  {isAdmin && (
                    <Box sx={{}}>
                      <IconButton 
                        onClick={() => handleOpenDialog(room)}
                        sx={{ 
                          color: '#306ad0',
                          '&:hover': { color: '#5d91ed' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(room._id)}
                        sx={{ 
                          color: '#306ad0',
                          '&:hover': { color: '#5d91ed' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    color: '#04070b',
                    opacity: 0.8
                  }}
                >
                  {room.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {room.specializations.map((spec) => (
                    <Chip
                      key={spec._id}
                      label={spec.name}
                      size="small"
                      sx={{
                        bgcolor: '#dddbff',
                        color: '#4a4a4a ',
                        borderRadius: '6px',
                        '& .MuiChip-label': {
                          fontWeight: 500,
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {selectedRoom ? 'Edit Room' : 'Add New Room'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#306ad0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#306ad0',
              },
            }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#306ad0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#306ad0',
              },
            }}
          />
          <FormControl 
            fullWidth 
            margin="dense"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#306ad0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#306ad0',
              },
            }}
          >
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
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={specializations.find(spec => spec._id === value)?.name}
                      sx={{
                        bgcolor: '#dddbff',
                        color: '#040316 ',
                        borderRadius: '6px',
                        '& .MuiChip-label': {
                          fontWeight: 500,
                        },
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
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: '#04070b',
              '&:hover': {
                bgcolor: '#82a8ea',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#306ad0',
              '&:hover': {
                bgcolor: '#5d91ed',
              },
              textTransform: 'none',
            }}
          >
            {selectedRoom ? 'Save Changes' : 'Add Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
