import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Container,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const WaveBackground = () => (
  <Box
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    {/* First Wave */}
    <Box
      sx={{
        position: 'absolute',
        bottom: '0',
        left: 0,
        width: '100%',
        transform: 'translateY(10%)',
        opacity: 0.12,
      }}
    >
      <svg
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '320px' }}
      >
        <path
          fill="#306ad0"
          d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </Box>
    {/* Second Wave */}
    <Box
      sx={{
        position: 'absolute',
        bottom: '0',
        left: 0,
        width: '100%',
        transform: 'translateY(0%)',
        opacity: 0.2,
      }}
    >
      <svg
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '320px' }}
      >
        <path
          fill="#306ad0"
          d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,117.3C672,85,768,75,864,90.7C960,107,1056,149,1152,165.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </Box>
    {/* Floating Circles */}
    <Box
      sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #306ad0 30%, #82a8ea 90%)',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
          '100%': {
            transform: 'translateY(0px)',
          },
        },
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #306ad0 30%, #82a8ea 90%)',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '30%',
        right: '20%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #306ad0 30%, #82a8ea 90%)',
        opacity: 0.1,
        animation: 'float 7s ease-in-out infinite',
      }}
    />
  </Box>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      return;
    }
    try {
      await login(username, password);
    } catch (err) {
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f3f6fb',
      backgroundImage: 'linear-gradient(135deg, #f3f6fb 0%, #e2e8f4 100%)',
      overflow: 'hidden',
    }}
    >
      <WaveBackground />
      
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(48, 106, 208, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-50%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transform: 'rotate(45deg)',
              animation: 'shine 3s infinite',
            },
            '@keyframes shine': {
              '0%': {
                transform: 'translateX(-100%) rotate(45deg)',
              },
              '100%': {
                transform: 'translateX(100%) rotate(45deg)',
              },
            },
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #306ad0 0%, #82a8ea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 8px 32px rgba(48, 106, 208, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                animation: 'shimmer 2s infinite',
              },
              '@keyframes shimmer': {
                '0%': {
                  transform: 'translateX(-100%)',
                },
                '100%': {
                  transform: 'translateX(100%)',
                },
              },
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 40, color: '#ffffff' }} />
          </Box>

          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 1,
              color: '#04070b',
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #04070b 0%, #306ad0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome Back
          </Typography>

          <Typography 
            sx={{ 
              mb: 4,
              color: '#04070b',
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Sign in to Aesthetic Medicine Clinic
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(255, 77, 79, 0.1)',
                border: '1px solid rgba(255, 77, 79, 0.2)',
                color: '#ff4d4f',
                '& .MuiAlert-icon': {
                  color: '#ff4d4f',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: '#306ad0' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover fieldset': {
                    borderColor: '#82a8ea',
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
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#306ad0' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ color: '#306ad0' }}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover fieldset': {
                    borderColor: '#82a8ea',
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 4, 
                mb: 2,
                py: 2,
                fontSize: '1rem',
                fontWeight: 600,
                position: 'relative',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #306ad0 0%, #82a8ea 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(48, 106, 208, 0.3)',
                },
                textTransform: 'none',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                  animation: 'shimmer 2s infinite',
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px',
                      color: '#ffffff',
                    }}
                  />
                  <span style={{ opacity: 0 }}>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
