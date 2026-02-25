import React from 'react';
import { Box, Typography } from '@mui/material';

const SettingsPage: React.FC = () => (
  <Box p={3}>
    <Typography variant="h4">Einstellungen</Typography>
    <Typography color="text.secondary" mt={1}>
      Diese Seite ist noch in Entwicklung.
    </Typography>
  </Box>
);

export default SettingsPage;
