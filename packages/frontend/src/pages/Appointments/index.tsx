import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tooltip, 
  Button, 
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import InputAdornment from '@mui/material/InputAdornment';
import AppointmentModal from '../../components/AppointmentModal';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.ceil(minutes / 15) * 15} minutes`;
  } else {
    const hours = minutes / 60;
    return `${hours} hour(s)`;
  }
}

// Constants
const START_HOUR = 8;  // 8 AM
const END_HOUR = 20;   // 8 PM
const SLOT_HEIGHT = 120; // 120px height for each hour slot

const ItemTypes = {
  APPOINTMENT: 'appointment'
};

const APPOINTMENT_STATUS = {
  SCHEDULED: 'booked',
  CANCELED: 'canceled',
  ONGOING: 'ongoing',
} as const;

type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

const STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'info',
  [APPOINTMENT_STATUS.CANCELED]: 'warning',
  [APPOINTMENT_STATUS.ONGOING]: 'success',

} as const;

const STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'booked',
  [APPOINTMENT_STATUS.CANCELED]: 'canceled',
  [APPOINTMENT_STATUS.ONGOING]: 'ongoing',
} as const;

const ROOMS = [
  { id: '1', name: 'Room 1' },
  { id: '2', name: 'Room 2' },
  { id: '3', name: 'Room 3' },
  { id: '4', name: 'Room 4' },
  { id: '5', name: 'Room 5' },
  { id: '6', name: 'Room 6' },
];

const APPOINTMENT_COLORS = [
  '#3498db',  // Blue
  '#e74c3c',  // Red
  '#2ecc71',  // Green
  '#9b59b6',  // Purple
  '#f1c40f',  // Yellow
  '#1abc9c',  // Turquoise
  '#e67e22',  // Orange
  '#34495e',  // Navy Blue
  '#16a085',  // Dark Turquoise
  '#c0392b',  // Dark Red
  '#27ae60',  // Dark Green
  '#8e44ad',  // Dark Purple
  '#d35400',  // Dark Orange
  '#2980b9',  // Dark Blue
  '#f39c12'   // Dark Yellow
];

const getAppointmentColor = (appointmentId: string) => {
  // Use the appointment ID to consistently get the same color for the same appointment
  const colorIndex = Array.from(appointmentId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % APPOINTMENT_COLORS.length;
  const baseColor = APPOINTMENT_COLORS[colorIndex];
  
  return {
    backgroundColor: baseColor,
    '&:hover': {
      backgroundColor: baseColor,
      opacity: 0.9,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }
  };
};

const AppointmentBlock = ({ 
  appointment,
  onMove 
}: { 
  appointment: Appointment;
  onMove: (id: string, roomId: string, hour: number, minutes: number) => void;
}) => {
  const startTime = parseISO(appointment.startTime);
  const endTime = parseISO(appointment.endTime);
  
  const startHour = startTime.getHours();
  const startMinutes = startTime.getMinutes();
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  const top = ((startHour - START_HOUR) * 60 + startMinutes) * (SLOT_HEIGHT / 60) + 50;
  const height = durationMinutes * (SLOT_HEIGHT / 60);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.APPOINTMENT,
    item: { 
      id: appointment.id,
      duration: durationMinutes,
      originalRoom: appointment.roomId
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [appointment.id, durationMinutes]);

  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>
            {appointment.treatment.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#fff' }} />
              <Typography variant="body2" sx={{ color: '#fff' }}>
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
              <Typography variant="body2" sx={{ color: '#fff' }}>
                {appointment.patientName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon sx={{ fontSize: 16, color: '#fff' }} />
              <Typography variant="body2" sx={{ color: '#fff' }}>
                {appointment.doctorName}
              </Typography>
            </Box>
          </Box>
        </Box>
      }
      placement="right"
      arrow
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            bgcolor: alpha('#306ad0', 0.95),
            borderRadius: '8px',
            p: 1,
            maxWidth: 'none',
          },
          '& .MuiTooltip-arrow': {
            color: alpha('#306ad0', 0.95),
          },
        },
      }}
    >
      <Box
        ref={drag}
        sx={{
          position: 'absolute',
          left: '4px',
          right: '4px',
          top,
          height,
          ...getAppointmentColor(appointment.id),
          borderRadius: 1,
          color: 'white',
          padding: 1,
          fontSize: '0.875rem',
          overflow: 'hidden',
          cursor: 'move',
          opacity: isDragging ? 0.5 : 1,
          '&:hover': {
            opacity: 0.9,
            boxShadow: 2,
          },
          zIndex: 1,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {appointment.patientName}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {appointment.treatmentName}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Helper function to snap minutes to exact 15-minute intervals
const snapToInterval = (minutes: number): number => {
  // Force snap to closest 15-minute interval
  return Math.round(minutes / 15) * 15;
};

const TimeSlot = ({ 
  hour, 
  roomId,
  onDrop 
}: { 
  hour: number;
  roomId: string;
  onDrop: (id: string, roomId: string, hour: number, minutes: number) => void;
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.APPOINTMENT,
    hover: (item, monitor) => {
      const dropOffset = monitor.getClientOffset();
      const slotElement = slotRef.current;
      
      if (!dropOffset || !slotElement) return;
      
      const slotRect = slotElement.getBoundingClientRect();
      const relativeY = dropOffset.y - slotRect.top;
      const rawMinutes = Math.floor((relativeY / SLOT_HEIGHT) * 60);
      const snappedMinutes = snapToInterval(rawMinutes);
      
      setCurrentMinutes(snappedMinutes);
      setIsDraggingOver(true);
    },
    drop: (item: { id: string }, monitor) => {
      const dropOffset = monitor.getClientOffset();
      const slotElement = slotRef.current;
      
      if (!dropOffset || !slotElement) return;
      
      const slotRect = slotElement.getBoundingClientRect();
      const relativeY = dropOffset.y - slotRect.top;
      const rawMinutes = Math.floor((relativeY / SLOT_HEIGHT) * 60);
      const snappedMinutes = snapToInterval(rawMinutes);
      
      if (snappedMinutes === 60) {
        onDrop(item.id, roomId, hour + 1, 0);
      } else {
        onDrop(item.id, roomId, hour, snappedMinutes);
      }
      
      setCurrentMinutes(null);
      setIsDraggingOver(false);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [hour, roomId, onDrop]);

  // Reset states when not dragging over
  useEffect(() => {
    if (!isOver) {
      setCurrentMinutes(null);
      setIsDraggingOver(false);
    }
  }, [isOver]);

  // Combine refs
  const combinedRef = (element: HTMLDivElement | null) => {
    slotRef.current = element;
    drop(element);
  };

  // Show 15-minute interval guides
  const intervalGuides = [15, 30, 45].map((minutes) => (
    <Box
      key={minutes}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(minutes / 60) * 100}%`,
        borderBottom: '1px dashed rgba(0,0,0,0.1)',
        height: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: isDraggingOver ? 1 : 0.5,
        transition: 'opacity 0.2s ease',
      }}
    />
  ));

  // Show snap preview
  const snapPreview = currentMinutes !== null && isOver && (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: '0px',
          right: '0px',
          top: `${(currentMinutes / 60) * 100}%`,
          height: '2px',
          backgroundColor: '#1976d2',
          boxShadow: '0 0 4px rgba(25, 118, 210, 0.4)',
          zIndex: 2,
          transform: 'translateY(-1px)',
        }}
      />
      <Typography
        sx={{
          position: 'absolute',
          right: '8px',
          top: `${(currentMinutes / 60) * 100}%`,
          transform: 'translate(0, -50%)',
          color: '#1976d2',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 4px',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {currentMinutes === 60 
          ? `${(hour + 1).toString().padStart(2, '0')}:00`
          : `${hour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
        }
      </Typography>
    </>
  );

  return (
    <Box
      ref={combinedRef}
      sx={{
        height: SLOT_HEIGHT,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.02)',
        },
      }}
    >
      {intervalGuides}
      {snapPreview}
      {/* Time labels */}
      {[15, 30, 45].map((minutes) => (
        <Typography
          key={minutes}
          variant="caption"
          sx={{
            position: 'absolute',
            left: 4,
            top: `${(minutes / 60) * 100}%`,
            transform: 'translateY(-50%)',
            color: 'text.secondary',
            fontSize: '0.7rem',
            opacity: isDraggingOver ? 0.8 : 0.4,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          {minutes}
        </Typography>
      ))}
    </Box>
  );
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  // Get unique doctors from appointments
  const doctors = Array.isArray(appointments) 
    ? [...new Set(appointments.map(apt => `${apt.doctor?.firstName} ${apt.doctor?.lastName}`))]
    : [];

  useEffect(() => {
    fetchAppointments();
  }, [dateRange]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (dateRange.start) {
        filters.startDate = dateRange.start;
      }
      if (dateRange.end) {
        filters.endDate = dateRange.end;
      }
      console.log('Fetching with filters:', filters);
      const data = await appointmentService.getAppointments(filters);
      console.log('Received appointments:', data);
      
      // Ensure we have an array of appointments
      const appointmentsArray = Array.isArray(data) ? data : 
                              Array.isArray(data?.appointments) ? data.appointments : [];
      
      console.log('Setting appointments:', appointmentsArray);
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date ? (type === 'start' ? startOfDay(date) : endOfDay(date)) : null
    }));
  };

  const handleCreateAppointment = () => {
    setIsModalOpen(true);
  };

  const handleMoveAppointment = (id: string, roomId: string, hour: number, minutes: number) => {
    setAppointments(prevAppointments => {
      return prevAppointments.map(apt => {
        if (apt.id === id) {
          const startTime = new Date(apt.startTime);
          startTime.setHours(hour);
          startTime.setMinutes(minutes);
          
          const endTime = new Date(startTime);
          const duration = parseISO(apt.endTime).getTime() - parseISO(apt.startTime).getTime();
          endTime.setTime(startTime.getTime() + duration);
          
          return {
            ...apt,
            roomId: roomId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          };
        }
        return apt;
      });
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedDate(parseISO(appointment.startTime));
    setView('calendar');
  };

  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentCreated = () => {
    // Only refresh the data, don't show loading state
    fetchAppointments();
  };

  // Filter appointments based on search and date range
  const filteredAppointments = (appointments || []).filter(appointment => {
    if (!appointment) return false;
    
    try {
      const appointmentDate = parseISO(appointment.startTime);
      const matchesDateRange = (!dateRange.start || appointmentDate >= dateRange.start) &&
                             (!dateRange.end || appointmentDate <= dateRange.end);
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (appointment.patient?.firstName?.toLowerCase().includes(searchLower) || false) ||
        (appointment.patient?.lastName?.toLowerCase().includes(searchLower) || false) ||
        (appointment.doctor?.firstName?.toLowerCase().includes(searchLower) || false) ||
        (appointment.doctor?.lastName?.toLowerCase().includes(searchLower) || false) ||
        (appointment.treatment?.name?.toLowerCase().includes(searchLower) || false);

      return matchesDateRange && matchesSearch;
    } catch (error) {
      console.error('Error filtering appointment:', appointment, error);
      return false;
    }
  });

  console.log('Filtered appointments:', filteredAppointments);

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <Dialog 
        open={!!selectedAppointment} 
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            bgcolor: '#f3f6fb',
          }
        }}
      >
        <DialogTitle 
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '2px solid #306ad0',
            m: 2,
            pb: 2,
            color: '#04070b',
            fontWeight: 600,
          }}
        >
          <EventIcon sx={{ color: '#306ad0' }} />
          Appointment Details
          {selectedAppointment && (
            <Chip 
              label={STATUS_LABELS[selectedAppointment.status]}
              size="small"
              color={STATUS_COLORS[selectedAppointment.status]}
              sx={{ 
                ml: 'auto',
                borderRadius: '6px',
                '& .MuiChip-label': {
                  fontWeight: 500,
                },
              }}
            />
          )}
        </DialogTitle>

        <DialogContent sx={{ px: 4 }}>
          {selectedAppointment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                  Date & Time Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <EventIcon sx={{ color: '#306ad0' }} />
                  <Box>
                    <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                      {format(parseISO(selectedAppointment.startTime), 'PPP')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7 }}>
                      {format(parseISO(selectedAppointment.startTime), 'p')} - {' '}
                      {format(parseISO(selectedAppointment.endTime), 'p')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                  Patient Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2, alignItems: 'center' }}>
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Name:</Typography>
                  <Typography sx={{ color: '#04070b', fontWeight: 500 }}>{selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</Typography>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Email:</Typography>
                  <Typography sx={{ color: '#04070b' }}>{selectedAppointment.patient?.email}</Typography>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Phone:</Typography>
                  <Typography sx={{ color: '#04070b' }}>{selectedAppointment.patient?.phoneNumber}</Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                  Treatment Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2, alignItems: 'center' }}>
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Treatment:</Typography>
                  <Typography sx={{ color: '#04070b', fontWeight: 500 }}>{selectedAppointment.treatment?.name}</Typography>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Duration:</Typography>
                  <Typography sx={{ color: '#04070b' }}>{selectedAppointment.treatment?.duration}</Typography>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Price:</Typography>
                  <Typography sx={{ color: '#04070b' }}>{selectedAppointment.treatment?.price}</Typography>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Doctor:</Typography>
                  <Box>
                    <Typography sx={{ color: '#04070b', fontWeight: 500 }}>{selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}</Typography>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7 }}>
                      {selectedAppointment.doctor?.specialty}
                    </Typography>
                  </Box>
                  
                  <Typography sx={{ color: '#04070b', opacity: 0.7 }}>Room:</Typography>
                  <Chip 
                    label={selectedAppointment.room.name.slice(-3)} 
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '6px',
                      bgcolor: alpha('#306ad0', 0.1),
                      borderColor: 'transparent',
                      color: '#306ad0',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Paper>

              {selectedAppointment.note && (
                <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)' }}>
                  <Typography variant="subtitle1" sx={{ color: '#306ad0', fontWeight: 600, mb: 2 }}>
                    Notes
                  </Typography>
                  <Typography sx={{ color: '#04070b' }}>{selectedAppointment.note}</Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => handleAppointmentClick(selectedAppointment!)}
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            sx={{
              color: '#306ad0',
              borderColor: '#306ad0',
              '&:hover': {
                borderColor: '#5d91ed',
                bgcolor: 'rgba(48, 106, 208, 0.1)',
              },
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            View in Calendar
          </Button>
          <Button 
            onClick={() => setSelectedAppointment(null)}
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

  const renderAppointmentPreview = (appointment: Appointment) => (
    <Paper sx={{ 
      p: 2.5,
      maxWidth: 400,
      borderRadius: '12px',
      bgcolor: 'rgba(255, 255, 255, 0.98)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '10px',
          bgcolor: alpha('#306ad0', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <EventIcon sx={{ color: '#306ad0' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#04070b', mb: 0.5 }}>
            {appointment.treatment?.name}
          </Typography>
          <Chip 
            label={STATUS_LABELS[appointment.status]}
            size="small"
            color={STATUS_COLORS[appointment.status]}
            sx={{ 
              borderRadius: '6px',
              height: 24,
              '& .MuiChip-label': { fontWeight: 500 }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
            <AccessTimeIcon sx={{ fontSize: 20, color: '#306ad0' }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Time
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
            {format(parseISO(appointment.startTime), 'h:mm a')} - {format(parseISO(appointment.endTime), 'h:mm a')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
            {format(parseISO(appointment.startTime), 'MMM d, yyyy')}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
            <MeetingRoomIcon sx={{ fontSize: 20, color: '#306ad0' }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Room
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
            {appointment.room?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
            {formatMinutes(appointment.treatment?.duration)}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ 
        p: 2, 
        bgcolor: alpha('#306ad0', 0.04), 
        borderRadius: '8px',
        display: 'flex',
        gap: 2
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ fontSize: 20, color: '#306ad0' }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Patient
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
            {`${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
            {appointment.patient?.phoneNumber}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <LocalHospitalIcon sx={{ fontSize: 20, color: '#306ad0' }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Doctor
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
            {appointment.doctor?.firstName} {appointment.doctor?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
            {appointment.doctor?.specialty}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const renderListView = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        bgcolor: '#ffffff',
        '& .MuiTableCell-root': {
          borderColor: 'rgba(0,0,0,0.08)',
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
                <AccessTimeIcon fontSize="small" sx={{ color: '#306ad0' }} />
                Date & Time
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" sx={{ color: '#306ad0' }} />
                Patient
              </Box>
            </TableCell>
            <TableCell>Contact Info</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon fontSize="small" sx={{ color: '#306ad0' }} />
                Treatment
              </Box>
            </TableCell>
            <TableCell>Price</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" sx={{ color: '#306ad0' }} />
                Doctor
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MeetingRoomIcon fontSize="small" sx={{ color: '#306ad0' }} />
                Room
              </Box>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAppointments.map((appointment) => (
            <Tooltip
              key={appointment.id}
              title={renderAppointmentPreview(appointment)}
              placement="left-start"
              arrow
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    bgcolor: 'transparent',
                    p: 0,
                    maxWidth: 'none',
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(255, 255, 255, 0.98)',
                    '&::before': {
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    },
                  },
                },
                modifiers: [
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'window',
                      altAxis: true,
                      padding: 16
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['right-start', 'left-start', 'top', 'bottom'],
                    },
                  }
                ]
              }}
            >
              <TableRow
                hover
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: alpha('#306ad0', 0.02), 
                  '&:hover': {
                    bgcolor: alpha('#306ad0', 0.06), 
                  },
                }}
                onClick={() => handleOpenDetails(appointment)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                      {format(parseISO(appointment.startTime), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {format(parseISO(appointment.startTime), 'h:mm a')} - {format(parseISO(appointment.endTime), 'h:mm a')}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                    {`${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#04070b' }}>
                      {appointment.patient?.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {appointment.patient?.phoneNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                      {appointment.treatment?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {formatMinutes(appointment.treatment?.duration)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                    {appointment.treatment?.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#04070b' }}>
                      {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      {/* {appointment.doctor?.specializations?.map(s => s).join(', ')} */}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={appointment.room.name.slice(-3)} 
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '6px',
                      bgcolor: alpha('#306ad0', 0.1),
                      borderColor: 'transparent',
                      color: '#306ad0',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={appointment.status}
                    size="small"
                    color={STATUS_COLORS[appointment.status]}
                    sx={{ 
                      borderRadius: '6px',
                      '& .MuiChip-label': {
                        fontWeight: 500,
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    justifyContent: 'center',
                  }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(appointment);
                        }}
                        sx={{
                          color: '#306ad0',
                          '&:hover': {
                            bgcolor: alpha('#306ad0', 0.1),
                          },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View in Calendar">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                        sx={{
                          color: '#306ad0',
                          '&:hover': {
                            bgcolor: alpha('#306ad0', 0.1),
                          },
                        }}
                      >
                        <CalendarMonthIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </Tooltip>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCalendarView = () => (
    <Paper sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
        {/* Time Column */}
        <Box sx={{ 
          width: 80, 
          flexShrink: 0, 
          borderRight: 1, 
          borderColor: 'divider',
          bgcolor: 'grey.100',
          position: 'sticky',
          left: 0,
          zIndex: 3,
        }}>
          <Box sx={{ 
            height: 50, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 4,
          }}>
            Time
          </Box>

          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
            <Box
              key={hour}
              sx={{
                height: SLOT_HEIGHT,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
              }}
            >
              {format(new Date().setHours(hour, 0, 0), 'h a')}
            </Box>
          ))}
        </Box>

        {/* Room Columns */}
        {ROOMS.map((room) => (
          <Box
            key={room.id}
            sx={{
              flex: 1,
              minWidth: 200,
              borderRight: 1,
              borderColor: 'divider',
              position: 'relative',
            }}
          >
            <Box sx={{ 
              height: 50, 
              borderBottom: 1, 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              bgcolor: 'grey.100',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}>
              {room.name}
            </Box>

            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
              <TimeSlot
                key={`${room.id}-${hour}`}
                hour={hour}
                roomId={room.id}
                onDrop={handleMoveAppointment}
              />
            ))}

            {filteredAppointments
              .filter(apt => {
                // Extract the room number from appointment's room name (last 3 digits)
                const appointmentRoomNumber = apt.room.name.match(/\d{3}/)?.[0]?.slice(-1);
                // Match with current room's number (last character)
                const currentRoomNumber = room.id;
                
                // Debug log for room matching
                console.log('Room matching:', {
                  appointmentRoom: apt.room.name,
                  appointmentRoomNumber,
                  currentRoom: room.name,
                  currentRoomNumber,
                  matches: appointmentRoomNumber === currentRoomNumber,
                  startTime: apt.startTime,
                  endTime: apt.endTime
                });

                return appointmentRoomNumber === currentRoomNumber;
              })
              .map(appointment => {
                const startTime = parseISO(appointment.startTime);
                const endTime = parseISO(appointment.endTime);
                const startHour = startTime.getHours();
                const startMinutes = startTime.getMinutes();
                const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                
                // Calculate position
                const top = ((startHour - START_HOUR) * 60 + startMinutes) * (SLOT_HEIGHT / 60) + 50;
                const height = durationMinutes * (SLOT_HEIGHT / 60);

                // Debug log for appointment positioning
                console.log('Appointment positioning:', {
                  id: appointment._id,
                  patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                  startTime: format(startTime, 'HH:mm'),
                  endTime: format(endTime, 'HH:mm'),
                  top,
                  height,
                  room: appointment.room.name,
                  roomMatch: {
                    appointmentRoom: appointment.room.name,
                    currentRoom: room.name
                  }
                });

                return (
                  <Tooltip
                    key={appointment._id}
                    title={renderAppointmentPreview(appointment)}
                    placement="left-start"
                    arrow
                    PopperProps={{
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          bgcolor: 'transparent',
                          p: 0,
                          maxWidth: 'none',
                        },
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(255, 255, 255, 0.98)',
                          '&::before': {
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                          },
                        },
                      },
                      modifiers: [
                        {
                          name: 'preventOverflow',
                          options: {
                            boundary: 'window',
                            altAxis: true,
                            padding: 16
                          },
                        },
                        {
                          name: 'flip',
                          options: {
                            fallbackPlacements: ['right-start', 'left-start', 'top', 'bottom'],
                          },
                        }
                      ]
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '4px',
                        right: '4px',
                        top,
                        height,
                        ...getAppointmentColor(appointment._id),
                        borderRadius: '8px',
                        color: 'white',
                        padding: durationMinutes <= 30 ? '4px 8px' : 1.5,
                        fontSize: durationMinutes <= 30 ? '0.75rem' : '0.875rem',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleOpenDetails(appointment)}
                    >
                      {durationMinutes <= 30 ? (
                        // Compact view for short appointments
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {`${format(startTime, 'HH:mm')} ${appointment.patient.firstName} ${appointment.patient.lastName}`}
                          </Typography>
                        </Box>
                      ) : (
                        // Full view for longer appointments
                        <>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {appointment.treatment.name}
                          </Typography>
                          <Typography variant="caption">
                            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
          </Box>
        ))}
      </Box>
    </Paper>
  );

  const renderFilters = () => (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
          <DatePicker
            label="From Date"
            value={dateRange.start}
            onChange={(date) => handleDateRangeChange('start', date)}
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 }
              }
            }}
          />
          <DatePicker
            label="To Date"
            value={dateRange.end}
            onChange={(date) => handleDateRangeChange('end', date)}
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 }
              }
            }}
          />
        </Box>
      </LocalizationProvider>

      <TextField
        size="small"
        placeholder="Search appointments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ flexGrow: 1, maxWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreateAppointment}
        sx={{
          bgcolor: '#306ad0',
          '&:hover': {
            bgcolor: '#2857b0',
          },
        }}
      >
        New Appointment
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#04070b', fontWeight: 600 }}>
        Appointments
      </Typography>

      {renderFilters()}

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={view} 
          onChange={(_, newValue) => setView(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 100,
            },
          }}
        >
          <Tab 
            icon={<ListAltIcon />} 
            label="List" 
            value="list"
            sx={{ 
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          />
          <Tab 
            icon={<CalendarMonthIcon />} 
            label="Calendar" 
            value="calendar"
            sx={{ 
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        view === 'list' ? renderListView() : renderCalendarView()
      )}

      {renderAppointmentDetails()}

      <AppointmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </Box>
  );
};

export default Appointments;
