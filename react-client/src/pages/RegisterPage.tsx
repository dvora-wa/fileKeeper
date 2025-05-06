import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { Paper, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
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
          <RegisterForm />
          <Box sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Sign in
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;