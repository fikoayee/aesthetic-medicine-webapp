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

// Mock data
const MOCK_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'Anna Smith',
    patientEmail: 'anna.smith@email.com',
    patientPhone: '+1 234-567-8901',
    treatmentName: 'Quick Checkup',
    treatmentDuration: '15 min',
    treatmentPrice: '$50',
    doctorName: 'Dr. Brown',
    doctorSpecialty: 'General',
    startTime: '2025-02-02T09:00:00',
    endTime: '2025-02-02T09:15:00',
    roomId: '1',
    status: APPOINTMENT_STATUS.SCHEDULED,
    notes: 'First time patient',
    color: '#4CAF50'
  },
  {
    id: '2',
    patientName: 'John Doe',
    patientEmail: 'john.doe@email.com',
    patientPhone: '+1 234-567-8902',
    treatmentName: 'Dental Cleaning',
    treatmentDuration: '30 min',
    treatmentPrice: '$100',
    doctorName: 'Dr. White',
    doctorSpecialty: 'Dental',
    startTime: '2025-02-02T10:00:00',
    endTime: '2025-02-02T10:30:00',
    roomId: '2',
    status: APPOINTMENT_STATUS.IN_PROGRESS,
    notes: 'Regular checkup',
    color: '#2196F3'
  },
  {
    id: '3',
    patientName: 'Mary Johnson',
    patientEmail: 'mary.j@email.com',
    patientPhone: '+1 234-567-8903',
    treatmentName: 'Root Canal',
    treatmentDuration: '45 min',
    treatmentPrice: '$300',
    doctorName: 'Dr. Green',
    doctorSpecialty: 'Dental Surgery',
    startTime: '2025-02-02T11:00:00',
    endTime: '2025-02-02T11:45:00',
    roomId: '3',
    status: APPOINTMENT_STATUS.COMPLETED,
    notes: 'Follow-up needed in 2 weeks',
    color: '#FF9800'
  },
  {
    id: '4',
    patientName: 'James Wilson',
    patientEmail: 'j.wilson@email.com',
    patientPhone: '+1 234-567-8904',
    treatmentName: 'Full Checkup',
    treatmentDuration: '1 hour',
    treatmentPrice: '$200',
    doctorName: 'Dr. Black',
    doctorSpecialty: 'General',
    startTime: '2025-02-02T13:00:00',
    endTime: '2025-02-02T14:00:00',
    roomId: '4',
    status: APPOINTMENT_STATUS.CANCELLED,
    notes: 'Rescheduling needed',
    color: '#9C27B0'
  }
];

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
          backgroundColor: appointment.color,
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const navigate = useNavigate();

  // Get unique doctors from appointments
  const doctors = Array.isArray(appointments) 
    ? [...new Set(appointments.map(apt => `${apt.doctor?.firstName} ${apt.doctor?.lastName}`))]
    : [];

  const fetchAppointments = async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const today = startOfDay(new Date());
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      console.log('Fetching appointments for date range:', {
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString()
      });

      const appointments = await appointmentService.getAppointments({
        startDate: today,
        endDate: nextWeek
      });
      
      console.log('Received appointments:', appointments);
      setAppointments(appointments);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAppointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments(true);
  }, []);

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
    fetchAppointments(false);
  };

  // Filter appointments based on all criteria
  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(apt => {
    const matchesSearch = !searchQuery ? true : (
      apt.treatment?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${apt.doctor?.firstName} ${apt.doctor?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.patient?.phoneNumber?.includes(searchQuery) || '')
    );

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    const matchesDoctors = selectedDoctors.length === 0 || 
      selectedDoctors.includes(`${apt.doctor?.firstName} ${apt.doctor?.lastName}`);

    const matchesDateRange = !dateRange.start || !dateRange.end ? true :
      isWithinInterval(new Date(apt.startTime), {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end)
      });

    const matchesDate = selectedDate && view === 'calendar' ? 
      isSameDay(new Date(apt.startTime), selectedDate) : 
      true;

    return matchesSearch && matchesDate && matchesStatus && matchesDoctors && matchesDateRange;
  }) : [];

  // Log whenever appointments or filtered appointments change
  useEffect(() => {
    console.log('Current appointments:', appointments);
    console.log('Filtered appointments:', filteredAppointments);
  }, [appointments, filteredAppointments]);

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
                    label={selectedAppointment.room?.name}
                    size="small"
                    sx={{
                      bgcolor: '#dddbff',
                      color: '#040316',
                      borderRadius: '6px',
                      width: 'fit-content',
                      '& .MuiChip-label': {
                        fontWeight: 500,
                      },
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
              placement="right"
              arrow
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    bgcolor: 'transparent',
                    p: 0,
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(255, 255, 255, 0.98)',
                    '&::before': {
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    },
                  },
                },
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
                    <Typography variant="caption" sx={{ color: '#666' }}>
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
              .filter(apt => apt.room._id === room.id)
              .map(appointment => (
                <AppointmentBlock 
                  key={appointment._id} 
                  appointment={appointment}
                  onMove={handleMoveAppointment}
                />
              ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f3f6fb', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#04070b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <EventIcon sx={{ color: '#306ad0' }} />
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAppointment}
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
          New Appointment
        </Button>
      </Box>

      <Paper 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(48, 106, 208, 0.1)',
          bgcolor: '#ffffff',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#306ad0' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
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

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                label="Status"
                sx={{
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: '#82a8ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#306ad0',
                  },
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%',
                          bgcolor: `${STATUS_COLORS[value as AppointmentStatus]}.main`
                        }} 
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                multiple
                value={selectedDoctors}
                onChange={(e) => setSelectedDoctors(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                label="Doctor"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
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
                    ))}
                  </Box>
                )}
                sx={{
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: '#82a8ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#306ad0',
                  },
                }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor} value={doctor}>
                    {doctor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', gap: 1, }}>
              <Tooltip title="List View">
                <IconButton 
                  onClick={() => setView('list')}
                  sx={{ 
                    color: view === 'list' ? '#306ad0' : '#04070b',
                    bgcolor: view === 'list' ? 'rgba(48, 106, 208, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(48, 106, 208, 0.1)',
                    },
                  }}
                >
                  <ListAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Calendar View">
                <IconButton 
                  onClick={() => setView('calendar')}
                  sx={{ 
                    color: view === 'calendar' ? '#306ad0' : '#04070b',
                    bgcolor: view === 'calendar' ? 'rgba(48, 106, 208, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(48, 106, 208, 0.1)',
                    },
                  }}
                >
                  <CalendarMonthIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {view === 'calendar' ? (
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={setSelectedDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
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
            ) : (
              <Box sx={{ display: 'flex', gap: 2, }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
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
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
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
              </Box>
            )}
          </LocalizationProvider>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {initialLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          view === 'list' ? renderListView() : renderCalendarView()
        )}
      </Box>

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
