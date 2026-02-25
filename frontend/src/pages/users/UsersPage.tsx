import React from 'react';
import { Box, Typography } from '@mui/material';

const UsersPage: React.FC = () => (
  <Box p={3}>
    <Typography variant="h4">Benutzerverwaltung</Typography>
    <Typography color="text.secondary" mt={1}>
      Diese Seite ist noch in Entwicklung.
    </Typography>
  </Box>
);

export default UsersPage;