// RTF Reporting Tool - XBRL Export & Validation Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import {
  CloudDownload,
  CloudUpload,
  Check,
  Error,
  Info,
  Refresh,
  Visibility,
  Delete,
  GetApp,
  Upload
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { formsApi } from '../../services/formsApi';

interface XBRLJob {
  id: string;
  type: 'generate' | 'validate' | 'submit';
  formId: string;
  formCode: string;
  reportingPeriod: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  outputFile?: string;
  validationResults?: {
    valid: boolean;
    errors: Array<{ message: string; severity: 'error' | 'warning' }>;
    warnings: Array<{ message: string }>;
  };
}

const XBRLPage: React.FC = () => {
  // State management
  const [jobs, setJobs] = useState<XBRLJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [reportingPeriods, setReportingPeriods] = useState<any[]>([]);

  // Dialog states
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Form states
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load available forms and reporting periods
        const [formsResponse, periodsResponse] = await Promise.all([
          formsApi.getFormDefinitions({ limit: 100 }),
          formsApi.getReportingPeriods()
        ]);

        setAvailableForms(formsResponse.forms);
        setReportingPeriods(periodsResponse);

        // Load mock XBRL jobs
        const mockJobs: XBRLJob[] = [
          {
            id: 'job-1',
            type: 'generate',
            formId: 'grp31',
            formCode: 'GRP31',
            reportingPeriod: '2024-12-31',
            status: 'completed',
            createdAt: '2024-01-15T10:00:00Z',
            completedAt: '2024-01-15T10:05:00Z',
            outputFile: 'GRP31_2024-12-31.xbrl'
          },
          {
            id: 'job-2',
            type: 'validate',
            formId: 'rsk12',
            formCode: 'RSK12',
            reportingPeriod: '2024-12-31',
            status: 'completed',
            createdAt: '2024-01-14T15:30:00Z',
            completedAt: '2024-01-14T15:32:00Z',
            validationResults: {
              valid: false,
              errors: [
                { message: 'Pflichtfeld "Kreditvolumen" ist leer', severity: 'error' as const },
                { message: 'Ungültiger Wert in Zeile 15', severity: 'error' as const }
              ],
              warnings: [
                { message: 'Wert liegt außerhalb des erwarteten Bereichs' }
              ]
            }
          },
          {
            id: 'job-3',
            type: 'submit',
            formId: 'rdp-r11',
            formCode: 'RDP-R11',
            reportingPeriod: '2024-12-31',
            status: 'running',
            createdAt: '2024-01-16T09:00:00Z'
          }
        ];
        setJobs(mockJobs);
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der XBRL-Daten');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // File upload handler
  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.xml', '.xbrl'],
      'text/xml': ['.xml']
    },
    multiple: true
  });

  // Event handlers
  const handleGenerate = async () => {
    if (!selectedForm || !selectedPeriod) return;

    try {
      // Mock XBRL generation
      const newJob: XBRLJob = {
        id: 'job-' + Date.now(),
        type: 'generate',
        formId: selectedForm,
        formCode: availableForms.find(f => f.id === selectedForm)?.code || selectedForm,
        reportingPeriod: selectedPeriod,
        status: 'running',
        createdAt: new Date().toISOString()
      };

      setJobs(prev => [newJob, ...prev]);
      setGenerateDialogOpen(false);

      // Simulate completion after 3 seconds
      setTimeout(() => {
        setJobs(prev => prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'completed' as const, completedAt: new Date().toISOString(), outputFile: `${job.formCode}_${job.reportingPeriod}.xbrl` }
            : job
        ));
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Fehler bei der XBRL-Generierung');
    }
  };

  const handleValidate = async () => {
    if (uploadedFiles.length === 0) return;

    try {
      // Mock validation
      const newJob: XBRLJob = {
        id: 'job-' + Date.now(),
        type: 'validate',
        formId: 'upload',
        formCode: uploadedFiles[0].name.split('.')[0],
        reportingPeriod: 'unknown',
        status: 'running',
        createdAt: new Date().toISOString()
      };

      setJobs(prev => [newJob, ...prev]);
      setValidateDialogOpen(false);

      // Simulate validation result after 2 seconds
      setTimeout(() => {
        setJobs(prev => prev.map(job =>
          job.id === newJob.id
            ? {
                ...job,
                status: 'completed' as const,
                completedAt: new Date().toISOString(),
                validationResults: {
                  valid: Math.random() > 0.5,
                  errors: Math.random() > 0.5 ? [{ message: 'Beispiel-Validierungsfehler', severity: 'error' as const }] : [],
                  warnings: [{ message: 'Beispiel-Warnung' }]
                }
              }
            : job
        ));
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Fehler bei der XBRL-Validierung');
    }
  };

  const handleSubmit = async () => {
    if (!selectedForm || !selectedPeriod) return;

    try {
      // Mock submission
      const newJob: XBRLJob = {
        id: 'job-' + Date.now(),
        type: 'submit',
        formId: selectedForm,
        formCode: availableForms.find(f => f.id === selectedForm)?.code || selectedForm,
        reportingPeriod: selectedPeriod,
        status: 'running',
        createdAt: new Date().toISOString()
      };

      setJobs(prev => [newJob, ...prev]);
      setSubmitDialogOpen(false);

      // Simulate completion after 5 seconds
      setTimeout(() => {
        setJobs(prev => prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'completed' as const, completedAt: new Date().toISOString() }
            : job
        ));
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'Fehler bei der XBRL-Übermittlung');
    }
  };

  const handleDownload = (job: XBRLJob) => {
    if (job.outputFile) {
      // Simulate file download
      const blob = new Blob(['Mock XBRL content'], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = job.outputFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      default: return 'default';
    }
  };

  const getJobStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Wartend';
      case 'running': return 'Läuft';
      case 'completed': return 'Abgeschlossen';
      case 'failed': return 'Fehlgeschlagen';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        XBRL Export & Validierung
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Generieren, validieren und übermitteln Sie XBRL-Dokumente für Ihre RTF-Meldungen
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudDownload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                XBRL Generieren
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Erstellen Sie XBRL-Instanzdokumente aus Ihren RTF-Formularen.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setGenerateDialogOpen(true)}
              >
                Generieren
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Check sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                XBRL Validieren
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Validieren Sie XBRL-Dateien gegen Bundesbank-Schemas.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setValidateDialogOpen(true)}
              >
                Validieren
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudUpload sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                An Bundesbank senden
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Übermitteln Sie validierte XBRL-Dateien an die Deutsche Bundesbank.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setSubmitDialogOpen(true)}
              >
                Senden
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Job History */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">
            XBRL-Vorgänge ({jobs.length})
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Aktualisieren
          </Button>
        </Box>

        {jobs.length === 0 ? (
          <Alert severity="info">
            Noch keine XBRL-Vorgänge durchgeführt.
          </Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Typ</TableCell>
                <TableCell>Formular</TableCell>
                <TableCell>Berichtszeitraum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Erstellt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Chip
                      label={
                        job.type === 'generate' ? 'Generierung' :
                        job.type === 'validate' ? 'Validierung' : 'Übermittlung'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {job.formCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.reportingPeriod}</TableCell>
                  <TableCell>
                    <Chip
                      label={getJobStatusLabel(job.status)}
                      color={getJobStatusColor(job.status) as any}
                      size="small"
                    />
                    {job.status === 'running' && (
                      <LinearProgress sx={{ mt: 1, width: 100 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(job.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {job.outputFile && (
                        <Tooltip title="Datei herunterladen">
                          <IconButton size="small" onClick={() => handleDownload(job)}>
                            <GetApp />
                          </IconButton>
                        </Tooltip>
                      )}
                      {job.validationResults && (
                        <Tooltip title="Validierungsergebnisse anzeigen">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Generate Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>XBRL-Dokument generieren</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Formular</InputLabel>
              <Select
                value={selectedForm}
                label="Formular"
                onChange={(e) => setSelectedForm(e.target.value)}
              >
                {availableForms.map((form) => (
                  <MenuItem key={form.id} value={form.id}>
                    {form.code} - {form.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Berichtszeitraum</InputLabel>
              <Select
                value={selectedPeriod}
                label="Berichtszeitraum"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {reportingPeriods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!selectedForm || !selectedPeriod}
          >
            Generieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validate Dialog */}
      <Dialog
        open={validateDialogOpen}
        onClose={() => setValidateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>XBRL-Datei validieren</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                mb: 2
              }}
            >
              <input {...getInputProps()} />
              <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                XBRL-Dateien hochladen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
              </Typography>
            </Paper>

            {uploadedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Ausgewählte Dateien:
                </Typography>
                {uploadedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidateDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleValidate}
            variant="contained"
            disabled={uploadedFiles.length === 0}
          >
            Validieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>An Bundesbank übermitteln</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              Bitte stellen Sie sicher, dass das XBRL-Dokument validiert wurde, bevor Sie es übermitteln.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Formular</InputLabel>
              <Select
                value={selectedForm}
                label="Formular"
                onChange={(e) => setSelectedForm(e.target.value)}
              >
                {availableForms.filter(f => jobs.some(j => j.formId === f.id && j.status === 'completed')).map((form) => (
                  <MenuItem key={form.id} value={form.id}>
                    {form.code} - {form.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Berichtszeitraum</InputLabel>
              <Select
                value={selectedPeriod}
                label="Berichtszeitraum"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {reportingPeriods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedForm || !selectedPeriod}
          >
            Übermitteln
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default XBRLPage;