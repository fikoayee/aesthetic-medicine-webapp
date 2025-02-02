import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';
import { alpha } from '@mui/material/styles';

// Constants
const START_HOUR = 8;  // 8 AM
const END_HOUR = 20;   // 8 PM
const SLOT_HEIGHT = 120; // 120px height for each hour slot

const ItemTypes = {
  APPOINTMENT: 'appointment'
};

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
    treatmentName: 'Quick Checkup',
    doctorName: 'Dr. Brown',
    startTime: '2025-02-02T09:00:00',
    endTime: '2025-02-02T09:15:00',  // 15 min
    roomId: '1',
    color: '#4CAF50'
  },
  {
    id: '2',
    patientName: 'John Doe',
    treatmentName: 'Dental Cleaning',
    doctorName: 'Dr. White',
    startTime: '2025-02-02T10:00:00',
    endTime: '2025-02-02T10:30:00',  // 30 min
    roomId: '2',
    color: '#2196F3'
  },
  {
    id: '3',
    patientName: 'Mary Johnson',
    treatmentName: 'Root Canal',
    doctorName: 'Dr. Green',
    startTime: '2025-02-02T11:00:00',
    endTime: '2025-02-02T11:45:00',  // 45 min
    roomId: '3',
    color: '#FF9800'
  },
  {
    id: '4',
    patientName: 'James Wilson',
    treatmentName: 'Full Checkup',
    doctorName: 'Dr. Black',
    startTime: '2025-02-02T13:00:00',
    endTime: '2025-02-02T14:00:00',  // 1 hour
    roomId: '4',
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

  const handleAppointmentMove = (id: string, newRoomId: string, newHour: number, minutes: number = 0) => {
    setAppointments(prevAppointments => {
      return prevAppointments.map(apt => {
        if (apt.id === id) {
          const startTime = new Date(apt.startTime);
          startTime.setHours(newHour);
          startTime.setMinutes(minutes);
          
          const endTime = new Date(startTime);
          const duration = parseISO(apt.endTime).getTime() - parseISO(apt.startTime).getTime();
          endTime.setTime(startTime.getTime() + duration);
          
          return {
            ...apt,
            roomId: newRoomId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          };
        }
        return apt;
      });
    });
  };

  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => {
    return START_HOUR + index;
  });

  return (
    <Box p={3}>
      <Paper 
        sx={{ 
          height: '80vh',
          overflow: 'auto',
          position: 'relative',
          '& ::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '& ::-webkit-scrollbar-track': {
            backgroundColor: '#f5f5f5',
          },
          '& ::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: 4,
          },
        }}
      >
        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          {/* Time Column - Sticky on X axis */}
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
            {/* Time Header - Sticky on both X and Y axes */}
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

            {/* Time Slots */}
            {timeSlots.map((hour) => (
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
                {`${hour}:00`}
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
              {/* Room Header - Sticky on Y axis */}
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

              {/* Time Slots for Room */}
              {timeSlots.map((hour) => (
                <TimeSlot
                  key={`${room.id}-${hour}`}
                  hour={hour}
                  roomId={room.id}
                  onDrop={handleAppointmentMove}
                />
              ))}

              {/* Appointment Blocks */}
              {appointments
                .filter(apt => apt.roomId === room.id)
                .map(appointment => (
                  <AppointmentBlock 
                    key={appointment.id} 
                    appointment={appointment}
                    onMove={handleAppointmentMove}
                  />
                ))}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Appointments;
