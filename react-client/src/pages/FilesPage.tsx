import React from 'react';
import { Container, Typography } from '@mui/material';

const FilesPage: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Files
      </Typography>
      {/* קומפוננטות לניהול קבצים יתווספו כאן */}
    </Container>
  );
};

export default FilesPage;