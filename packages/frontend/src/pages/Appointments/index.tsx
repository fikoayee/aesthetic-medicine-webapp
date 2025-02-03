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

// Constants
const START_HOUR = 8;  // 8 AM
const END_HOUR = 20;   // 8 PM
const SLOT_HEIGHT = 120; // 120px height for each hour slot

const ItemTypes = {
  APPOINTMENT: 'appointment'
};

const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

const STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'info',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'warning',
  [APPOINTMENT_STATUS.COMPLETED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'error',
  [APPOINTMENT_STATUS.NO_SHOW]: 'error'
} as const;

const STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show'
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
  appointment: typeof MOCK_APPOINTMENTS[0];
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
        <div>
          <div><strong>Patient:</strong> {appointment.patientName}</div>
          <div><strong>Treatment:</strong> {appointment.treatmentName}</div>
          <div><strong>Doctor:</strong> {appointment.doctorName}</div>
          <div><strong>Time:</strong> {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</div>
        </div>
      }
      arrow
      placement="right"
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
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof MOCK_APPOINTMENTS[0] | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const navigate = useNavigate();

  // Get unique doctors from appointments
  const doctors = [...new Set(appointments.map(apt => apt.doctorName))];

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

  // Filter appointments based on all criteria
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchQuery === '' || 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    const matchesDoctors = selectedDoctors.length === 0 || selectedDoctors.includes(apt.doctorName);

    const matchesDateRange = !dateRange.start || !dateRange.end ? true :
      isWithinInterval(parseISO(apt.startTime), {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end)
      });

    const matchesDate = selectedDate && view === 'calendar' ? 
      isSameDay(parseISO(apt.startTime), selectedDate) : 
      true;

    return matchesSearch && matchesDate && matchesStatus && matchesDoctors && matchesDateRange;
  });

  const handleAppointmentClick = (appointment: typeof MOCK_APPOINTMENTS[0]) => {
    setSelectedDate(parseISO(appointment.startTime));
    setView('calendar');
  };

  const handleOpenDetails = (appointment: typeof MOCK_APPOINTMENTS[0]) => {
    setSelectedAppointment(appointment);
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <Dialog 
        open={!!selectedAppointment} 
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Appointment Details
          <Chip 
            label={STATUS_LABELS[selectedAppointment.status]}
            size="small"
            color={STATUS_COLORS[selectedAppointment.status]}
            sx={{ ml: 1 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, py: 2 }}>
            <Typography color="text.secondary">Date & Time:</Typography>
            <Typography>
              {format(parseISO(selectedAppointment.startTime), 'PPP p')} - {' '}
              {format(parseISO(selectedAppointment.endTime), 'p')}
            </Typography>

            <Typography color="text.secondary">Patient:</Typography>
            <Box>
              <Typography>{selectedAppointment.patientName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAppointment.patientEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAppointment.patientPhone}
              </Typography>
            </Box>

            <Typography color="text.secondary">Treatment:</Typography>
            <Box>
              <Typography>{selectedAppointment.treatmentName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {selectedAppointment.treatmentDuration}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {selectedAppointment.treatmentPrice}
              </Typography>
            </Box>

            <Typography color="text.secondary">Doctor:</Typography>
            <Box>
              <Typography>{selectedAppointment.doctorName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAppointment.doctorSpecialty}
              </Typography>
            </Box>

            <Typography color="text.secondary">Room:</Typography>
            <Typography>
              {ROOMS.find(r => r.id === selectedAppointment.roomId)?.name}
            </Typography>

            <Typography color="text.secondary">Notes:</Typography>
            <Typography>{selectedAppointment.notes}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAppointmentClick(selectedAppointment)}>
            View in Calendar
          </Button>
          <Button onClick={() => setSelectedAppointment(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderAppointmentPreview = (appointment: typeof MOCK_APPOINTMENTS[0]) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        {appointment.patientName}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1, fontSize: '0.875rem' }}>
        <Typography color="text.secondary">Email:</Typography>
        <Typography>{appointment.patientEmail}</Typography>
        
        <Typography color="text.secondary">Phone:</Typography>
        <Typography>{appointment.patientPhone}</Typography>
        
        <Typography color="text.secondary">Treatment:</Typography>
        <Typography>{appointment.treatmentName}</Typography>
        
        <Typography color="text.secondary">Duration:</Typography>
        <Typography>{appointment.treatmentDuration}</Typography>
        
        <Typography color="text.secondary">Price:</Typography>
        <Typography>{appointment.treatmentPrice}</Typography>
        
        <Typography color="text.secondary">Doctor:</Typography>
        <Typography>{appointment.doctorName} ({appointment.doctorSpecialty})</Typography>
        
        <Typography color="text.secondary">Notes:</Typography>
        <Typography>{appointment.notes}</Typography>
      </Box>
    </Box>
  );

  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date & Time</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Treatment</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAppointments
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((appointment) => (
              <Tooltip
                key={appointment.id}
                title={renderAppointmentPreview(appointment)}
                placement="top"
                arrow
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      maxWidth: 'none',
                      position: 'fixed',
                      left: '50% !important',
                      transform: 'translateX(-50%) translateY(0) !important',
                      zIndex: 9999
                    },
                    '& .MuiTooltip-arrow': {
                      left: '50% !important',
                      transform: 'translateX(-50%) !important'
                    }
                  }
                }}
              >
                <TableRow 
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOpenDetails(appointment)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon fontSize="small" color="action" />
                      {format(parseISO(appointment.startTime), 'MMM d, yyyy h:mm a')}
                    </Box>
                  </TableCell>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.patientEmail}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patientPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.treatmentName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.treatmentDuration}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{appointment.treatmentPrice}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.doctorName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.doctorSpecialty}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ROOMS.find(r => r.id === appointment.roomId)?.name} 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={STATUS_LABELS[appointment.status]}
                      size="small"
                      color={STATUS_COLORS[appointment.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(appointment);
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
              .filter(apt => apt.roomId === room.id)
              .map(appointment => (
                <AppointmentBlock 
                  key={appointment.id} 
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 3,
        gap: 2 
      }}>
        <Typography variant="h4">Appointments Schedule</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Doctors</InputLabel>
              <Select
                multiple
                value={selectedDoctors}
                label="Filter by Doctors"
                onChange={(e) => setSelectedDoctors(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5
                    },
                  },
                }}
              >
                {doctors.map(doctor => (
                  <MenuItem key={doctor} value={doctor}>
                    {doctor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="Date From"
                  value={dateRange.start}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="Date To"
                  value={dateRange.end}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          <Box>
            <Tooltip title="Filter by Status">
              <Box>
                {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
                  <Chip
                    key={value}
                    label={STATUS_LABELS[value]}
                    size="small"
                    color={statusFilter === value ? STATUS_COLORS[value] : 'default'}
                    onClick={() => setStatusFilter(statusFilter === value ? 'all' : value)}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Tooltip>
          </Box>
          
          {view === 'calendar' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          )}

          <Tabs 
            value={view} 
            onChange={(_, newValue) => setView(newValue)}
            sx={{ minHeight: 40 }}
          >
            <Tab 
              icon={<ListAltIcon />} 
              value="list" 
              label="List" 
              sx={{ minHeight: 40 }}
            />
            <Tab 
              icon={<CalendarMonthIcon />} 
              value="calendar" 
              label="Calendar"
              sx={{ minHeight: 40 }}
            />
          </Tabs>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAppointment}
          >
            Create Appointment
          </Button>
        </Box>
      </Box>

      {view === 'list' ? renderListView() : renderCalendarView()}
      {renderAppointmentDetails()}

      <AppointmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Refresh appointments here
        }}
      />
    </Box>
  );
};

export default Appointments;
