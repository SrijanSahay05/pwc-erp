import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Step 1: Request Password Reset
  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        await axios.post('http://localhost:8000/api/users/reset-password/', {
          email: values.email,
        });
        setEmail(values.email);
        setSuccess('Reset code sent successfully!');
        setStep(2);
        setResendDisabled(true);
        setCountdown(30);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to send reset code');
      } finally {
        setLoading(false);
      }
    },
  });

  // Step 2: Verify OTP and Set New Password
  const resetFormik = useFormik({
    initialValues: {
      otp: '',
      new_password: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required('Verification code is required'),
      new_password: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        await axios.put('http://localhost:8000/api/users/reset-password/', {
          email,
          otp: values.otp,
          new_password: values.new_password,
        });
        setSuccess('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:8000/api/users/reset-password/', {
        email,
      });
      setSuccess('Reset code resent successfully!');
      setResendDisabled(true);
      setCountdown(30);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend reset code');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

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
            {step === 1 ? 'Reset Password' : 'Verify & Set New Password'}
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

          {step === 1 ? (
            <Box component="form" onSubmit={emailFormik.handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange}
                error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                helperText={emailFormik.touched.email && emailFormik.errors.email}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
              </Button>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={resetFormik.handleSubmit} sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                Please enter the verification code sent to<br />
                <strong>{email}</strong>
              </Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Verification Code"
                name="otp"
                value={resetFormik.values.otp}
                onChange={resetFormik.handleChange}
                error={resetFormik.touched.otp && Boolean(resetFormik.errors.otp)}
                helperText={resetFormik.touched.otp && resetFormik.errors.otp}
                disabled={loading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="new_password"
                label="New Password"
                name="new_password"
                type={showPassword ? 'text' : 'password'}
                value={resetFormik.values.new_password}
                onChange={resetFormik.handleChange}
                error={resetFormik.touched.new_password && Boolean(resetFormik.errors.new_password)}
                helperText={resetFormik.touched.new_password && resetFormik.errors.new_password}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  color="primary"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  sx={{ textTransform: 'none' }}
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend verification code'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 