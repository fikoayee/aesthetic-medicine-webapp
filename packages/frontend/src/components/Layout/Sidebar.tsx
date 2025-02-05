import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  LocalHospital as DoctorsIcon,
  MedicalServices as TreatmentsIcon,
  Room as RoomsIcon,
  Settings as SettingsIcon,
  Psychology as SpecializationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 245;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Appointments', icon: <CalendarIcon />, path: '/appointments' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Doctors', icon: <DoctorsIcon />, path: '/doctors' },
    { text: 'Treatments', icon: <TreatmentsIcon />, path: '/treatments' },
    { text: 'Specializations', icon: <SpecializationsIcon />, path: '/specializations' },
    { text: 'Rooms', icon: <RoomsIcon />, path: '/rooms' },
  ];

  // Only show settings to admin
  if (user?.role === 'ADMIN') {
    menuItems.push({ text: 'Settings', icon: <SettingsIcon />, path: '/settings' });
  }

  const drawer = (
    <Box 
      sx={{ 
        mt: '64px',
        px: 2,
        py: 2,
        height: '100%',
        bgcolor: '#fdfdfd',
      }}
    >
      <Typography 
        variant="overline" 
        sx={{ 
          px: 2, 
          color: '#666',
          fontWeight: 600,
          letterSpacing: '0.1em',
        }}
      >
        MENU
      </Typography>
      
      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: '#306ad0',
                  color: '#fff',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                  '&:hover': {
                    bgcolor: '#2857b0',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(48, 106, 208, 0.08)',
                },
                transition: 'all 0.2s ease',
                py: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'inherit' : '#666',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  letterSpacing: '0.02em',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={!isMobile}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: '#fdfdfd',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
