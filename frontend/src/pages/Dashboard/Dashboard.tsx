import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios';

interface PersonalInfo {
  profile_image: string | null;
  dob: string | null;
  gender: string;
  nationality: string;
  religion: string;
  aadhar_card: string;
  father_name: string;
  mother_name: string;
  blood_group: string;
  permanentAddress_City: string;
  permanentAddress_State: string;
}

interface ApiCall {
  timestamp: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  response: {
    status: number;
    statusText: string;
    data: any;
  } | null;
  error: {
    timestamp: string;
    error: string;
    response: any;
    status: number;
  } | null;
}

interface ErrorLog {
  timestamp: string;
  error: string;
  response: any;
  status: number;
}

interface DebugInfo {
  apiCalls: ApiCall[];
  errors: ErrorLog[];
  rawData: any;
  authToken: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const sections = [
  {
    title: 'Personal Information',
    description: 'Complete your personal and contact details',
    icon: <PersonIcon sx={{ fontSize: 40 }} />,
    path: '/personal-info',
    status: 'active' as const,
    isComplete: false
  },
  {
    title: 'Course Selection',
    description: 'Choose your preferred courses',
    icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
    path: '/course-selection',
    status: 'disabled' as const,
    isComplete: false
  },
  {
    title: 'Educational Profile',
    description: 'Add your educational background',
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    path: '/education',
    status: 'disabled' as const,
    isComplete: false
  },
  {
    title: 'Preview & Pay',
    description: 'Review and complete your application',
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    path: '/payment',
    status: 'disabled' as const,
    isComplete: false
  }
];

const Dashboard: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    apiCalls: [],
    errors: [],
    rawData: null,
    authToken: null
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/api/users/token/refresh/', {
        refresh: refreshToken
      });

      localStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const handleNavigation = (path: string, status: string) => {
    if (status === 'active') {
      navigate(path);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPersonalInfo = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get('/api/users/personal-info/');
        
        if (!isMounted) return;
        setPersonalInfo(response.data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.error || 'Failed to fetch personal information');
        
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPersonalInfo();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Application Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: section.status === 'active' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: section.status === 'active' ? 'scale(1.02)' : 'none',
                    boxShadow: section.status === 'active' ? 6 : 1
                  },
                  opacity: section.status === 'disabled' ? 0.7 : 1,
                  position: 'relative'
                }}
                onClick={() => handleNavigation(section.path, section.status)}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {section.isComplete && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'success.main'
                      }}
                    />
                  )}
                  <Box sx={{ 
                    mb: 2,
                    color: section.status === 'active' ? 'primary.main' : 'text.secondary'
                  }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                  {section.status === 'disabled' && (
                    <Button 
                      variant="outlined" 
                      disabled 
                      size="small" 
                      sx={{ mt: 2 }}
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;