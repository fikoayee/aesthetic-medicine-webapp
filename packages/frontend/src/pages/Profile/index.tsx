import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Chip,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Lock as LockIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import UserService from '../../services/userService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DoctorSpecialization {
  _id: string;
  name: string;
}

const Profile = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [specializations, setSpecializations] = useState<DoctorSpecialization[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const userData = await UserService.getUserProfile(userId);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        username: userData.username,
      });
      setUserRole(userData.role);

      if (userData.role === 'DOCTOR' && userData.doctor?.specializations) {
        setSpecializations(userData.doctor.specializations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.updateUserProfile(userId, formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await UserService.changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          borderRadius: '16px',
          bgcolor: '#ffffff',
          boxShadow: '0 8px 32px rgba(48, 106, 208, 0.1)',
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            mb: 4,
            pb: 4,
            borderBottom: '2px solid',
            borderColor: 'rgba(48, 106, 208, 0.1)',
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#306ad0',
              fontSize: '2.5rem',
              fontWeight: 600,
              mb: { xs: 2, sm: 0 },
              mr: { xs: 0, sm: 4 },
              boxShadow: '0 4px 12px rgba(48, 106, 208, 0.2)',
            }}
          >
            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: '#04070b',
                fontWeight: 600,
                mb: 1,
              }}
            >
              {formData.firstName} {formData.lastName}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#04070b',
                  opacity: 0.7,
                }}
              >
                @{formData.username}
              </Typography>
              <Chip
                label={userRole.toLowerCase().replace('_', ' ')}
                color={userRole === 'ADMIN' ? 'error' : userRole === 'DOCTOR' ? 'primary' : 'success'}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  borderRadius: '8px',
                  px: 1,
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                  boxShadow: (theme) => `0 4px 12px ${
                    userRole === 'ADMIN' 
                      ? theme.palette.error.main + '40'
                      : userRole === 'DOCTOR'
                      ? theme.palette.primary.main + '40'
                      : theme.palette.success.main + '40'
                  }`
                }}
              />
              {userRole === 'DOCTOR' && specializations.length > 0 && (
                <Box 
                  sx={{ 
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  {specializations.map((spec) => (
                    <Chip
                      key={spec._id}
                      label={spec.name}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(48, 106, 208, 0.1)',
                        color: '#306ad0',
                        fontWeight: 500,
                        borderRadius: '8px',
                        '& .MuiChip-label': {
                          px: 1.5,
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                bgcolor: 'rgba(48, 106, 208, 0.03)',
                p: 3,
                borderRadius: '12px',
                height: '100%',
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#04070b',
                  }}
                >
                  Personal Information
                </Typography>
                <IconButton
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    color: '#306ad0',
                    '&:hover': {
                      bgcolor: 'rgba(48, 106, 208, 0.1)',
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'grid', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon sx={{ color: '#306ad0' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Full Name
                    </Typography>
                    <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                      {formData.firstName} {formData.lastName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ color: '#306ad0' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Email Address
                    </Typography>
                    <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                      {formData.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon sx={{ color: '#306ad0' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                      Phone Number
                    </Typography>
                    <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                      {formData.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                bgcolor: 'rgba(48, 106, 208, 0.03)',
                p: 3,
                borderRadius: '12px',
                height: '100%',
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#04070b',
                  }}
                >
                  Security
                </Typography>
                <Button
                  startIcon={<LockIcon />}
                  onClick={() => setIsChangingPassword(true)}
                  variant="outlined"
                  sx={{
                    color: '#306ad0',
                    borderColor: 'rgba(48, 106, 208, 0.5)',
                    '&:hover': {
                      borderColor: '#306ad0',
                      bgcolor: 'rgba(48, 106, 208, 0.05)',
                    },
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  Change Password
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                    Last Password Change
                  </Typography>
                  <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                    Not available
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#04070b', opacity: 0.7, mb: 0.5 }}>
                    Two-Factor Authentication
                  </Typography>
                  <Typography sx={{ color: '#04070b', fontWeight: 500 }}>
                    Not enabled
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={isEditing} 
          onClose={() => setIsEditing(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(48, 106, 208, 0.1)',
            },
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1,
              color: '#04070b',
              fontWeight: 600,
            }}
          >
            Edit Profile
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setIsEditing(false)}
              sx={{
                color: '#04070b',
                opacity: 0.7,
                '&:hover': {
                  bgcolor: 'rgba(4, 7, 11, 0.05)',
                },
                textTransform: 'none',
                borderRadius: '8px',
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
                borderRadius: '8px',
                px: 3,
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog 
          open={isChangingPassword} 
          onClose={() => setIsChangingPassword(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(48, 106, 208, 0.1)',
            },
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1,
              color: '#04070b',
              fontWeight: 600,
            }}
          >
            Change Password
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setIsChangingPassword(false)}
              sx={{
                color: '#04070b',
                opacity: 0.7,
                '&:hover': {
                  bgcolor: 'rgba(4, 7, 11, 0.05)',
                },
                textTransform: 'none',
                borderRadius: '8px',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              variant="contained"
              sx={{
                bgcolor: '#306ad0',
                '&:hover': {
                  bgcolor: '#5d91ed',
                },
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
              }}
            >
              Update Password
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSuccess(null)} 
            severity="success"
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 200, 83, 0.2)',
            }}
          >
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error"
            sx={{ 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)',
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Profile;
