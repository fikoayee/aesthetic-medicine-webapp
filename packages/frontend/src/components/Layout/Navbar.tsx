import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, Chip } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { SpaLogo } from './SpaLogo';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#fdfdfd',
        color: '#04070b',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          flexGrow: 1,
          cursor: 'pointer',
          '&:hover .logo': {
            transform: 'scale(1.05)',
          }
        }}>
          <SpaLogo 
            className="logo"
            sx={{ 
              fontSize: 38,
              color: '#306ad0',
              filter: 'drop-shadow(0 2px 4px rgba(48, 106, 208, 0.2))',
              transition: 'transform 0.2s ease',
            }} 
          />
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#306ad0',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              BeautyMed
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Aesthetic Medicine Clinic
            </Typography>
          </Box>
        </Box>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={user?.role.toUpperCase()} 
              size="small"
              sx={{ 
                fontWeight: 600,
                bgcolor: '#306ad0',
                color: '#fff',
                borderRadius: '6px',
                px: 0.5,
                height: 24,
                '& .MuiChip-label': {
                  px: 1,
                }
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#04070b',
                fontWeight: 500,
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ 
                color: '#306ad0',
                bgcolor: 'rgba(48, 106, 208, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(48, 106, 208, 0.16)',
                }
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(48, 106, 208, 0.08)',
                  minWidth: 180,
                  '& .MuiMenuItem-root': {
                    py: 1,
                    px: 2,
                    borderRadius: '4px',
                    mx: 1,
                    my: 0.5,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#04070b',
                    '&:hover': {
                      bgcolor: 'rgba(48, 106, 208, 0.08)',
                    }
                  }
                }
              }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
