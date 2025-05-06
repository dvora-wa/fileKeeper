import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setErrorMessage(''); // ניקוי הודעות שגיאה קודמות
        const response = await login({
          email: values.email.trim(), // הסרת רווחים מיותרים
          password: values.password
        });
        setUser(response.user);
        navigate('/');
      } catch (error: any) {
        console.error('Login failed:', error);
        // טיפול בשגיאות ספציפיות
        if (error.response?.data) {
          setErrorMessage(error.response.data);
        } else {
          setErrorMessage('שגיאה בהתחברות. אנא נסה שנית.');
        }
      }
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          התחברות
        </Typography>
      </Box>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="אימייל"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="סיסמה"
          type="password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
        />
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          התחבר
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;