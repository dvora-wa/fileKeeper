import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Paper, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
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
          <LoginForm />
          <Box sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Register here
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;