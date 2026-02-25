import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box p={3} textAlign="center">
      <Typography variant="h3" gutterBottom>404</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Seite nicht gefunden
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
        Zum Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
