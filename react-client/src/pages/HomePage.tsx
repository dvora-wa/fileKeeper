import React from 'react';
import { Container, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to File Management System
      </Typography>
      {/* תוכן נוסף יתווסף כאן */}
    </Container>
  );
};

export default HomePage;