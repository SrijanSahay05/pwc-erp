import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PhoneVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const phone = user.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/login');
    } else {
      handleSendOTP();
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:8000/api/users/verify-phone/', { phone });
      setSuccess('OTP sent successfully!');
      setResendDisabled(true);
      setCountdown(30); // 30 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await axios.put('http://localhost:8000/api/users/verify-phone/', { phone, otp });
      setSuccess('Phone number verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Phone Verification
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Please enter the verification code sent to<br />
            <strong>{phone}</strong>
          </Typography>

          <Box component="form" onSubmit={handleVerify} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Verification Code"
              name="otp"
              autoComplete="off"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !otp}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Phone Number'}
            </Button>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                color="primary"
                onClick={handleSendOTP}
                disabled={resendDisabled || loading}
                sx={{ textTransform: 'none' }}
              >
                {countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend Verification Code'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PhoneVerification; 