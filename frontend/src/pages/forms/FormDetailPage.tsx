// RTF Reporting Tool - Form Detail Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Edit,
  Download,
  Visibility,
  History,
  Assessment,
  ArrowBack,
  Schedule,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormDefinition, FormStatus } from '@rtf-tool/shared';
import { formsApi, FormInstanceData } from '../../services/formsApi';

const FormDetailPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  // State management
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formInstances, setFormInstances] = useState<FormInstanceData[]>([]);
  const [formHistory, setFormHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      if (!formId) return;

      try {
        setLoading(true);
        setError(null);

        // Load form definition
        const definition = await formsApi.getFormDefinition(formId);
        setFormDefinition(definition);

        // Load form instances for different reporting periods
        // This is a mock - in reality we'd have an endpoint to get all instances
        const mockInstances: FormInstanceData[] = [
          {
            instanceId: 'inst-1',
            formDefinitionId: formId,
            data: {},
            status: 'completed' as FormStatus,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            submittedAt: '2024-01-20T15:30:00Z',
            validatedAt: '2024-01-20T16:00:00Z',
            reportingPeriod: '2023-12-31'
          },
          {
            instanceId: 'inst-2',
            formDefinitionId: formId,
            data: {},
            status: 'in_review' as FormStatus,
            createdAt: '2024-02-01T09:00:00Z',
            updatedAt: '2024-02-15T14:20:00Z',
            reportingPeriod: '2024-03-31'
          }
        ];
        setFormInstances(mockInstances);

        // Load form history (mock data)
        const mockHistory = [
          {
            id: 'hist-1',
            action: 'Formular erstellt',
            timestamp: '2024-02-01T09:00:00Z',
            userId: 'user-1',
            userName: 'Max Mustermann'
          },
          {
            id: 'hist-2',
            action: 'Daten aktualisiert',
            timestamp: '2024-02-15T14:20:00Z',
            userId: 'user-1',
            userName: 'Max Mustermann'
          }
        ];
        setFormHistory(mockHistory);
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der Formular-Details');
        console.error('Error loading form details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId]);

  // Helper functions
  const getStatusColor = (status: FormStatus): 'default' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'draft': return 'default';
      case 'in_review': return 'warning';
      case 'submitted': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: FormStatus): string => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'in_review': return 'In Prüfung';
      case 'submitted': return 'Eingereicht';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'draft': return <Schedule />;
      case 'in_review': return <Warning />;
      case 'submitted': return <Info />;
      case 'completed': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async (instanceId: string, format: 'pdf' | 'excel' | 'xbrl') => {
    try {
      const instance = formInstances.find(i => i.instanceId === instanceId);
      if (!instance) return;

      const blob = await formsApi.exportForm(formId!, instance.reportingPeriod, format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formId}_${instance.reportingPeriod}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Exportieren');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !formDefinition) {
    return (
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/forms')}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/forms" underline="hover">
          RTF Formulare
        </Link>
        <Typography color="text.primary">
          {formDefinition.code}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {formDefinition.code} - {formDefinition.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {formDefinition.sections?.length || 0} Abschnitte • Version {formDefinition.version}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip
                label={`${formInstances.length} Instanzen`}
                variant="outlined"
              />
              <Chip
                label={formInstances.filter(i => i.status === 'completed').length + ' abgeschlossen'}
                color="success"
                variant="outlined"
              />
            </Stack>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/forms')}
          >
            Zurück
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Form Instances */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formular-Instanzen
            </Typography>

            {formInstances.length === 0 ? (
              <Alert severity="info">
                Noch keine Instanzen für dieses Formular erstellt.
              </Alert>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Berichtszeitraum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Erstellt</TableCell>
                    <TableCell>Letzte Änderung</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formInstances.map((instance) => (
                    <TableRow key={instance.instanceId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {instance.reportingPeriod}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(instance.status)}
                          color={getStatusColor(instance.status)}
                          size="small"
                          icon={getStatusIcon(instance.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(instance.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(instance.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/forms/${formId}/edit/${instance.reportingPeriod}`)}
                          >
                            {instance.status === 'completed' || instance.status === 'submitted' ? 'Anzeigen' : 'Bearbeiten'}
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => handleExport(instance.instanceId, 'pdf')}
                          >
                            Export
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* Form Structure */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formular-Struktur
            </Typography>

            {formDefinition.sections?.map((section, index) => (
              <Card key={section.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {section.title}
                  </Typography>
                  {section.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {section.description}
                    </Typography>
                  )}
                  <Chip
                    label={`${section.fields?.length || 0} Felder`}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            )) || (
              <Alert severity="info">
                Keine Strukturinformationen verfügbar.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Aktionen
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                fullWidth
                onClick={() => {
                  // Navigate to create new instance or latest instance
                  const latestInstance = formInstances.find(i => i.status !== 'completed');
                  if (latestInstance) {
                    navigate(`/forms/${formId}/edit/${latestInstance.reportingPeriod}`);
                  } else {
                    // Create new instance dialog could be shown here
                    navigate(`/forms/${formId}/edit/2024-12-31`);
                  }
                }}
              >
                Bearbeiten
              </Button>

              <Button
                variant="outlined"
                startIcon={<Assessment />}
                fullWidth
              >
                Statistiken
              </Button>

              <Button
                variant="outlined"
                startIcon={<History />}
                fullWidth
              >
                Vollständiger Verlauf
              </Button>
            </Stack>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Letzte Aktivitäten
            </Typography>

            {formHistory.length === 0 ? (
              <Alert severity="info" icon={false}>
                Keine Aktivitäten verfügbar.
              </Alert>
            ) : (
              <List>
                {formHistory.slice(0, 5).map((item, index) => (
                  <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon>
                      <History color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.action}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            von {item.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            • {formatDate(item.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormDetailPage;