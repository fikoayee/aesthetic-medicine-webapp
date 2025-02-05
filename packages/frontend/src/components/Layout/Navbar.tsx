import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, Chip } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
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
        backgroundColor: '#f3f6fb',
        color: '#04070b',
        boxShadow: '0 1px 2px rgba(48, 106, 208, 0.05)',
        borderBottom: '1px solid',
        borderColor: '#82a8ea',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            color: '#306ad0'
          }}
        >
          Aesthetic Medicine Clinic
        </Typography>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={user?.role.toUpperCase()} 
              size="small"
              sx={{ 
                fontWeight: 500,
                bgcolor: '#306ad0',
                color: '#f3f6fb',
                borderRadius: '6px',
              }}
            />
            <Typography variant="body1" sx={{ color: '#04070b' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ 
                color: '#306ad0',
                '&:hover': {
                  bgcolor: '#82a8ea',
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
                  border: '1px solid',
                  borderColor: '#82a8ea',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(48, 106, 208, 0.05)',
                  bgcolor: '#f3f6fb'
                }
              }}
            >
              <MenuItem 
                onClick={handleProfile}
                sx={{ 
                  '&:hover': { 
                    bgcolor: '#82a8ea',
                    color: '#306ad0',
                  }
                }}
              >
                Profile
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  '&:hover': { 
                    bgcolor: '#82a8ea',
                    color: '#306ad0',
                  }
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Typography variant="body1" color="error">
            Not Authenticated
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
