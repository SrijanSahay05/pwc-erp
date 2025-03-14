import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface FormValues {
  user?: string;
  profile_image: File | null;
  dob: Date | null;
  gender: string;
  nationality: string;
  religion: string;
  aadhar_card: string;
  father_name: string;
  father_qualification: string;
  father_occupation: string;
  father_contact: string;
  mother_name: string;
  mother_qualification: string;
  mother_occupation: string;
  mother_contact: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_occupation: string;
  guardian_contact: string;
  permanentAddress_Country: string;
  permanentAddress_State: string;
  permanentAddress_City: string;
  permanentAddress_PinCode: string;
  permanentAddress_Address: string;
  is_same_as_permanentAddress: boolean;
  currentAddress_Country: string;
  currentAddress_State: string;
  currentAddress_City: string;
  currentAddress_PinCode: string;
  currentAddress_Address: string;
  blood_group: string;
  casteCategory: string;
  caste: string;
  caste_or_ews_certificate_issued_by: string;
  caste_or_ews_certificate_number: string;
  caste_or_ews_certificate_image: File | null;
}

const validationSchema = Yup.object({
  dob: Yup.date()
    .required('Date of Birth is required')
    .nullable()
    .transform((curr, orig) => orig === '' ? null : curr)
    .max(new Date(), 'Date of Birth cannot be in the future'),
  gender: Yup.string().required('Gender is required'),
  nationality: Yup.string().required('Nationality is required'),
  religion: Yup.string().required('Religion is required'),
  aadhar_card: Yup.string()
    .required('Aadhar Card number is required')
    .matches(/^\d{12}$/, 'Aadhar Card must be exactly 12 digits'),
  father_name: Yup.string().required('Father\'s name is required'),
  father_contact: Yup.string()
    .required('Father\'s contact is required')
    .matches(/^\d{10}$/, 'Contact number must be exactly 10 digits'),
  mother_name: Yup.string().required('Mother\'s name is required'),
  mother_contact: Yup.string()
    .required('Mother\'s contact is required')
    .matches(/^\d{10}$/, 'Contact number must be exactly 10 digits'),
  permanentAddress_Country: Yup.string().required('Country is required'),
  permanentAddress_State: Yup.string().required('State is required'),
  permanentAddress_City: Yup.string().required('City is required'),
  permanentAddress_PinCode: Yup.string()
    .required('PIN Code is required')
    .matches(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
  permanentAddress_Address: Yup.string().required('Address is required'),
  blood_group: Yup.string().required('Blood Group is required'),
  casteCategory: Yup.string().required('Caste Category is required'),
  caste: Yup.string().required('Caste is required'),
  currentAddress_Country: Yup.string().when(['is_same_as_permanentAddress'], {
    is: false,
    then: (schema) => schema.required('Country is required'),
    otherwise: (schema) => schema
  }),
  currentAddress_State: Yup.string().when(['is_same_as_permanentAddress'], {
    is: false,
    then: (schema) => schema.required('State is required'),
    otherwise: (schema) => schema
  }),
  currentAddress_City: Yup.string().when(['is_same_as_permanentAddress'], {
    is: false,
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema
  }),
  currentAddress_PinCode: Yup.string().when(['is_same_as_permanentAddress'], {
    is: false,
    then: (schema) => schema.matches(/^\d{6}$/, 'PIN Code must be exactly 6 digits').required('PIN Code is required'),
    otherwise: (schema) => schema
  }),
  currentAddress_Address: Yup.string().when(['is_same_as_permanentAddress'], {
    is: false,
    then: (schema) => schema.required('Address is required'),
    otherwise: (schema) => schema
  })
});

const PersonalInfo: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formik = useFormik<FormValues>({
    initialValues: {
      user: '',
      profile_image: null,
      dob: null,
      gender: '',
      nationality: '',
      religion: '',
      aadhar_card: '',
      father_name: '',
      father_qualification: '',
      father_occupation: '',
      father_contact: '',
      mother_name: '',
      mother_qualification: '',
      mother_occupation: '',
      mother_contact: '',
      guardian_name: '',
      guardian_relation: '',
      guardian_occupation: '',
      guardian_contact: '',
      permanentAddress_Country: '',
      permanentAddress_State: '',
      permanentAddress_City: '',
      permanentAddress_PinCode: '',
      permanentAddress_Address: '',
      is_same_as_permanentAddress: false,
      currentAddress_Country: '',
      currentAddress_State: '',
      currentAddress_City: '',
      currentAddress_PinCode: '',
      currentAddress_Address: '',
      blood_group: '',
      casteCategory: '',
      caste: '',
      caste_or_ews_certificate_issued_by: '',
      caste_or_ews_certificate_number: '',
      caste_or_ews_certificate_image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        if (!values.dob) {
          throw new Error('Date of Birth is required');
        }

        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.user_id;
        if (!userId) {
          throw new Error('User ID not found in token');
        }

        const formData = new FormData();
        formData.append('user', userId.toString());

        Object.keys(values).forEach((key) => {
          const value = values[key as keyof FormValues];
          if (value !== null && key !== 'user') {
            if (key === 'is_same_as_permanentAddress') {
              formData.append(key, value ? 'true' : 'false');
            } else if (key === 'dob' && value instanceof Date) {
              const year = value.getFullYear();
              const month = String(value.getMonth() + 1).padStart(2, '0');
              const day = String(value.getDate()).padStart(2, '0');
              formData.append(key, `${year}-${month}-${day}`);
            } else if (value instanceof Date) {
              formData.append(key, value.toISOString());
            } else {
              formData.append(key, value as string | Blob);
            }
          }
        });

        await axios.post(
          'http://localhost:8000/api/users/personal-info/',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setSuccess('Personal information saved successfully!');
      } catch (err: any) {
        setError(err.message || err.response?.data?.error || 'Failed to save personal information');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('No authentication token found');
          window.location.href = '/login';
          return;
        }

        const response = await axios.get(
          'http://localhost:8000/api/users/personal-info/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = {
          ...response.data,
          dob: response.data.dob ? new Date(response.data.dob) : null,
        };

        formik.setValues(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        setError(err.response?.data?.error || 'Failed to fetch personal information');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPersonalInfo();
  }, []);

  useEffect(() => {
    if (formik.values.is_same_as_permanentAddress) {
      formik.setValues({
        ...formik.values,
        currentAddress_Country: formik.values.permanentAddress_Country,
        currentAddress_State: formik.values.permanentAddress_State,
        currentAddress_City: formik.values.permanentAddress_City,
        currentAddress_PinCode: formik.values.permanentAddress_PinCode,
        currentAddress_Address: formik.values.permanentAddress_Address,
      });
    }
  }, [formik.values.is_same_as_permanentAddress, formik.values.permanentAddress_Country,
      formik.values.permanentAddress_State, formik.values.permanentAddress_City,
      formik.values.permanentAddress_PinCode, formik.values.permanentAddress_Address]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Personal Information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="image/*"
                type="file"
                id="profile_image"
                onChange={(event) => {
                  const files = event.currentTarget.files;
                  if (files && files.length > 0) {
                    formik.setFieldValue('profile_image', files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile_image">
                <Button variant="contained" component="span">
                  Upload Profile Image
                </Button>
              </label>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth *"
                  value={formik.values.dob}
                  onChange={(value) => {
                    formik.setFieldValue('dob', value);
                    formik.setFieldTouched('dob', true);
                  }}
                  slots={{
                    textField: TextField
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: formik.touched.dob && Boolean(formik.errors.dob),
                      helperText: formik.touched.dob && formik.errors.dob as string
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                >
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="transgender">Transgender</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="nationality"
                label="Nationality"
                value={formik.values.nationality}
                onChange={formik.handleChange}
                error={formik.touched.nationality && Boolean(formik.errors.nationality)}
                helperText={formik.touched.nationality && formik.errors.nationality}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="religion"
                label="Religion"
                value={formik.values.religion}
                onChange={formik.handleChange}
                error={formik.touched.religion && Boolean(formik.errors.religion)}
                helperText={formik.touched.religion && formik.errors.religion}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="aadhar_card"
                label="Aadhar Card Number"
                value={formik.values.aadhar_card}
                onChange={formik.handleChange}
                error={formik.touched.aadhar_card && Boolean(formik.errors.aadhar_card)}
                helperText={formik.touched.aadhar_card && formik.errors.aadhar_card}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  name="blood_group"
                  value={formik.values.blood_group}
                  onChange={formik.handleChange}
                  error={formik.touched.blood_group && Boolean(formik.errors.blood_group)}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Family Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Family Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="father_name"
                label="Father's Name"
                value={formik.values.father_name}
                onChange={formik.handleChange}
                error={formik.touched.father_name && Boolean(formik.errors.father_name)}
                helperText={formik.touched.father_name && formik.errors.father_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="father_qualification"
                label="Father's Qualification"
                value={formik.values.father_qualification}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="father_occupation"
                label="Father's Occupation"
                value={formik.values.father_occupation}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="father_contact"
                label="Father's Contact"
                value={formik.values.father_contact}
                onChange={formik.handleChange}
                error={formik.touched.father_contact && Boolean(formik.errors.father_contact)}
                helperText={formik.touched.father_contact && formik.errors.father_contact}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="mother_name"
                label="Mother's Name"
                value={formik.values.mother_name}
                onChange={formik.handleChange}
                error={formik.touched.mother_name && Boolean(formik.errors.mother_name)}
                helperText={formik.touched.mother_name && formik.errors.mother_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="mother_qualification"
                label="Mother's Qualification"
                value={formik.values.mother_qualification}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="mother_occupation"
                label="Mother's Occupation"
                value={formik.values.mother_occupation}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="mother_contact"
                label="Mother's Contact"
                value={formik.values.mother_contact}
                onChange={formik.handleChange}
                error={formik.touched.mother_contact && Boolean(formik.errors.mother_contact)}
                helperText={formik.touched.mother_contact && formik.errors.mother_contact}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="guardian_name"
                label="Guardian's Name"
                value={formik.values.guardian_name}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="guardian_relation"
                label="Guardian's Relation"
                value={formik.values.guardian_relation}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="guardian_occupation"
                label="Guardian's Occupation"
                value={formik.values.guardian_occupation}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="guardian_contact"
                label="Guardian's Contact"
                value={formik.values.guardian_contact}
                onChange={formik.handleChange}
              />
            </Grid>

            {/* Permanent Address Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Permanent Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="permanentAddress_Country"
                label="Country"
                value={formik.values.permanentAddress_Country}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress_Country && Boolean(formik.errors.permanentAddress_Country)}
                helperText={formik.touched.permanentAddress_Country && formik.errors.permanentAddress_Country}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="permanentAddress_State"
                label="State"
                value={formik.values.permanentAddress_State}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress_State && Boolean(formik.errors.permanentAddress_State)}
                helperText={formik.touched.permanentAddress_State && formik.errors.permanentAddress_State}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="permanentAddress_City"
                label="City"
                value={formik.values.permanentAddress_City}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress_City && Boolean(formik.errors.permanentAddress_City)}
                helperText={formik.touched.permanentAddress_City && formik.errors.permanentAddress_City}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="permanentAddress_PinCode"
                label="PIN Code"
                value={formik.values.permanentAddress_PinCode}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress_PinCode && Boolean(formik.errors.permanentAddress_PinCode)}
                helperText={formik.touched.permanentAddress_PinCode && formik.errors.permanentAddress_PinCode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="permanentAddress_Address"
                label="Address"
                multiline
                rows={3}
                value={formik.values.permanentAddress_Address}
                onChange={formik.handleChange}
                error={formik.touched.permanentAddress_Address && Boolean(formik.errors.permanentAddress_Address)}
                helperText={formik.touched.permanentAddress_Address && formik.errors.permanentAddress_Address}
              />
            </Grid>

            {/* Current Address Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Current Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_same_as_permanentAddress"
                    checked={formik.values.is_same_as_permanentAddress}
                    onChange={formik.handleChange}
                  />
                }
                label="Same as Permanent Address"
              />
            </Grid>

            {!formik.values.is_same_as_permanentAddress && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="currentAddress_Country"
                    label="Country"
                    value={formik.values.currentAddress_Country}
                    onChange={formik.handleChange}
                    error={formik.touched.currentAddress_Country && Boolean(formik.errors.currentAddress_Country)}
                    helperText={formik.touched.currentAddress_Country && formik.errors.currentAddress_Country}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="currentAddress_State"
                    label="State"
                    value={formik.values.currentAddress_State}
                    onChange={formik.handleChange}
                    error={formik.touched.currentAddress_State && Boolean(formik.errors.currentAddress_State)}
                    helperText={formik.touched.currentAddress_State && formik.errors.currentAddress_State}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="currentAddress_City"
                    label="City"
                    value={formik.values.currentAddress_City}
                    onChange={formik.handleChange}
                    error={formik.touched.currentAddress_City && Boolean(formik.errors.currentAddress_City)}
                    helperText={formik.touched.currentAddress_City && formik.errors.currentAddress_City}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="currentAddress_PinCode"
                    label="PIN Code"
                    value={formik.values.currentAddress_PinCode}
                    onChange={formik.handleChange}
                    error={formik.touched.currentAddress_PinCode && Boolean(formik.errors.currentAddress_PinCode)}
                    helperText={formik.touched.currentAddress_PinCode && formik.errors.currentAddress_PinCode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="currentAddress_Address"
                    label="Address"
                    multiline
                    rows={3}
                    value={formik.values.currentAddress_Address}
                    onChange={formik.handleChange}
                    error={formik.touched.currentAddress_Address && Boolean(formik.errors.currentAddress_Address)}
                    helperText={formik.touched.currentAddress_Address && formik.errors.currentAddress_Address}
                  />
                </Grid>
              </>
            )}

            {/* Caste Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Caste Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Caste Category</InputLabel>
                <Select
                  name="casteCategory"
                  value={formik.values.casteCategory}
                  onChange={formik.handleChange}
                  error={formik.touched.casteCategory && Boolean(formik.errors.casteCategory)}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="obc">OBC</MenuItem>
                  <MenuItem value="sc">SC</MenuItem>
                  <MenuItem value="st">ST</MenuItem>
                  <MenuItem value="ews">EWS</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="caste"
                label="Caste"
                value={formik.values.caste}
                onChange={formik.handleChange}
                error={formik.touched.caste && Boolean(formik.errors.caste)}
                helperText={formik.touched.caste && formik.errors.caste}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="caste_or_ews_certificate_issued_by"
                label="Certificate Issued By"
                value={formik.values.caste_or_ews_certificate_issued_by}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="caste_or_ews_certificate_number"
                label="Certificate Number"
                value={formik.values.caste_or_ews_certificate_number}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <input
                accept="image/*,.pdf"
                type="file"
                id="caste_or_ews_certificate_image"
                onChange={(event) => {
                  const files = event.currentTarget.files;
                  if (files && files.length > 0) {
                    formik.setFieldValue('caste_or_ews_certificate_image', files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="caste_or_ews_certificate_image">
                <Button variant="contained" component="span">
                  Upload Certificate
                </Button>
              </label>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Information'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PersonalInfo; 