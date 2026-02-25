// RTF Reporting Tool - Dashboard Page
import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton
} from '@mui/material';
import {
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Assessment,
  Download,
  Edit,
  Visibility
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import { useAppSelector } from '../../store';
import {
  selectUser,
  selectInstitution
} from '../../store/slices/authSlice';
import { FORM_CATEGORY_NAMES_DE } from '@rtf-tool/shared';

// Mock data for demonstration
const mockDashboardData = {
  formsCompleted: 18,
  formsTotal: 25,
  formsWithErrors: 2,
  nextDeadline: new Date('2024-02-15'),
  recentActivities: [
    {
      id: '1',
      formCode: 'GRP31',
      formName: FORM_CATEGORY_NAMES_DE.GRP,
      action: 'Erstellt',
      timestamp: new Date('2024-01-20T10:30:00'),
      status: 'draft'
    },
    {
      id: '2',
      formCode: 'RSK12',
      formName: FORM_CATEGORY_NAMES_DE.RSK,
      action: 'Aktualisiert',
      timestamp: new Date('2024-01-19T15:45:00'),
      status: 'in_review'
    },
    {
      id: '3',
      formCode: 'RDP-R11',
      formName: FORM_CATEGORY_NAMES_DE.RDP,
      action: 'Eingereicht',
      timestamp: new Date('2024-01-18T09:15:00'),
      status: 'submitted'
    }
  ],
  categoryStats: [
    { category: 'GRP', completed: 6, total: 8, name: FORM_CATEGORY_NAMES_DE.GRP },
    { category: 'RSK', completed: 8, total: 12, name: FORM_CATEGORY_NAMES_DE.RSK },
    { category: 'RDP', completed: 3, total: 4, name: FORM_CATEGORY_NAMES_DE.RDP },
    { category: 'ILAAP', completed: 1, total: 8, name: FORM_CATEGORY_NAMES_DE.ILAAP }
  ]
};

const DashboardPage: React.FC = () => {
  const user = useAppSelector(selectUser);
  const institution = useAppSelector(selectInstitution);

  useEffect(() => {
    // Load dashboard data
    // This would typically fetch real data from the API
  }, []);

  const completionPercentage = Math.round(
    (mockDashboardData.formsCompleted / mockDashboardData.formsTotal) * 100
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'in_review': return 'warning';
      case 'submitted': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'in_review': return 'In Prüfung';
      case 'submitted': return 'Eingereicht';
      case 'accepted': return 'Akzeptiert';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        {user && (
          <Typography variant="h6" color="text.secondary">
            Willkommen zurück, {user.firstName} {user.lastName}
          </Typography>
        )}
        {institution && (
          <Typography variant="body2" color="text.secondary">
            {institution.name} ({institution.bik})
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Completion Progress */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        Formular-Fortschritt
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mockDashboardData.formsCompleted} von {mockDashboardData.formsTotal} abgeschlossen
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {completionPercentage}% abgeschlossen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Errors & Warnings */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Warning color="error" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        Offene Probleme
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Formulare mit Fehlern
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h3" color="error.main">
                    {mockDashboardData.formsWithErrors}
                  </Typography>
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/forms?filter=errors"
                    sx={{ mt: 1 }}
                  >
                    Details anzeigen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Next Deadline */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        Nächste Frist
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Einreichung bis
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5" color="warning.main">
                    {formatDate(mockDashboardData.nextDeadline)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In 5 Tagen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schnellaktionen
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      component={RouterLink}
                      to="/forms"
                      fullWidth
                    >
                      Formular bearbeiten
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      component={RouterLink}
                      to="/xbrl"
                      fullWidth
                    >
                      XBRL exportieren
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Assessment />}
                      component={RouterLink}
                      to="/forms?status=draft"
                      fullWidth
                    >
                      Entwürfe anzeigen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recent Activities */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Letzte Aktivitäten
            </Typography>
            <List dense>
              {mockDashboardData.recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem
                    sx={{ px: 0 }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        component={RouterLink}
                        to={`/forms/${activity.formCode}`}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {activity.action === 'Erstellt' && <Assignment fontSize="small" />}
                      {activity.action === 'Aktualisiert' && <Edit fontSize="small" />}
                      {activity.action === 'Eingereicht' && <CheckCircle fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {activity.formCode}
                          </Typography>
                          <Chip
                            label={getStatusLabel(activity.status)}
                            size="small"
                            color={getStatusColor(activity.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {activity.action} • {formatDateTime(activity.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockDashboardData.recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Button
              size="small"
              component={RouterLink}
              to="/forms"
              sx={{ mt: 1 }}
            >
              Alle anzeigen
            </Button>
          </Paper>

          {/* Category Progress */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fortschritt nach Kategorie
            </Typography>
            <List dense>
              {mockDashboardData.categoryStats.map((category, index) => {
                const percentage = Math.round((category.completed / category.total) * 100);
                return (
                  <React.Fragment key={category.category}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {category.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {category.completed}/{category.total}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        }
                      />
                    </ListItem>
                    {index < mockDashboardData.categoryStats.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;