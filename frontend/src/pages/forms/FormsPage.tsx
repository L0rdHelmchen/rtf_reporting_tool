// RTF Reporting Tool - Forms Page
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Skeleton
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Assessment,
  FilterList,
  Refresh,
  Download,
  Upload
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { FORM_CATEGORY_NAMES_DE, FormStatus } from '@rtf-tool/shared';
import { formsApi, FormListItem, FormSearchParams } from '../../services/formsApi';
import {
  getFormDependency,
  getFormApplicability,
  FormRequirement
} from '../../utils/formDependencies';

// Form creation dialog component
interface NewFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateForm: (formDefinitionId: string, reportingPeriod: string) => void;
  availableForms: FormListItem[];
  reportingPeriods: Array<{ id: string; label: string; isActive: boolean }>;
}

const NewFormDialog: React.FC<NewFormDialogProps> = ({
  open,
  onClose,
  onCreateForm,
  availableForms,
  reportingPeriods
}) => {
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    if (open) {
      // Set default to current active period
      const activePeriod = reportingPeriods.find(p => p.isActive);
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    }
  }, [open, reportingPeriods]);

  const handleCreate = () => {
    if (selectedForm && selectedPeriod) {
      onCreateForm(selectedForm, selectedPeriod);
      onClose();
      setSelectedForm('');
      setSelectedPeriod('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Neues Formular erstellen</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Formulartyp</InputLabel>
            <Select
              value={selectedForm}
              label="Formulartyp"
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              {availableForms.map((form) => (
                <MenuItem key={form.id} value={form.id}>
                  <Box>
                    <Typography variant="body1">{form.code}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {form.name}
                    </Typography>
                  </Box>
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>{period.label}</Typography>
                    {period.isActive && (
                      <Chip label="Aktuell" size="small" color="primary" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!selectedForm || !selectedPeriod}
        >
          Erstellen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FormsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [availableForms, setAvailableForms] = useState<FormListItem[]>([]);
  const [reportingPeriods, setReportingPeriods] = useState<Array<{ id: string; label: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalForms, setTotalForms] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Dialog state
  const [newFormDialogOpen, setNewFormDialogOpen] = useState(false);

  // DBL Berichtsumfang (x030) — drives form dependency badges
  const [berichtsumfang, setBerichtsumfang] = useState<string | undefined>(undefined);

  // Filter state – initialized from URL query params
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState<FormStatus | ''>('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Sync selectedCategory when URL changes (e.g. sidebar click)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setCurrentPage(1);
  }, [searchParams]);

  // Debounced search
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Load data
  const loadForms = useCallback(async (params?: FormSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await formsApi.getFormDefinitions({
        search: debouncedSearchTerm || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        reportingPeriod: selectedPeriod || undefined,
        page: currentPage,
        limit: 12,
        ...params
      });

      setForms(response.forms);
      setTotalForms(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Formulare');
      console.error('Error loading forms:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory, selectedStatus, selectedPeriod, currentPage]);

  const loadAvailableForms = useCallback(async () => {
    try {
      const response = await formsApi.getFormDefinitions({ limit: 100 });
      setAvailableForms(response.forms);
    } catch (err) {
      console.error('Error loading available forms:', err);
    }
  }, []);

  const loadReportingPeriods = useCallback(async () => {
    try {
      const periods = await formsApi.getReportingPeriods();
      setReportingPeriods(periods);
    } catch (err) {
      console.error('Error loading reporting periods:', err);
    }
  }, []);

  // Initial load and reload when filters change
  useEffect(() => {
    loadForms();
  }, [loadForms]);

  useEffect(() => {
    loadAvailableForms();
    loadReportingPeriods();
  }, [loadAvailableForms, loadReportingPeriods]);

  // Load DBL instance to determine Berichtsumfang for dependency logic
  useEffect(() => {
    const period = selectedPeriod || new Date().getFullYear() + '-12-31';
    formsApi.getFormInstance('dbl', period)
      .then(inst => {
        setBerichtsumfang(inst?.data?.x030);
      })
      .catch(() => setBerichtsumfang(undefined));
  }, [selectedPeriod]);

  // Event handlers
  const handleCategoryFilter = (category: string) => {
    const next = category === selectedCategory ? '' : category;
    if (next) {
      setSearchParams({ category: next });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

  const handleCreateForm = async (formDefinitionId: string, reportingPeriod: string) => {
    try {
      await formsApi.createFormInstance(formDefinitionId, reportingPeriod);
      navigate(`/forms/${formDefinitionId}/edit/${reportingPeriod}`);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Erstellen des Formulars');
    }
  };

  const handleRefresh = () => {
    loadForms();
  };
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getDependencyBadge = (form: FormListItem) => {
    const dep = getFormDependency(form.code);
    if (!dep) return null;

    const applicability = getFormApplicability(form.code, berichtsumfang);

    const colorMap: Record<FormRequirement, 'success' | 'warning' | 'info'> = {
      always: 'success',
      consolidated: 'info',
      per_steuerungskreis: 'warning'
    };

    const chipColor = applicability === 'not_applicable' ? 'default' : colorMap[dep.requirement];
    const label = applicability === 'not_applicable' ? 'Nicht relevant' : dep.label;

    return (
      <Chip
        label={label}
        size="small"
        color={chipColor}
        variant="outlined"
        title={dep.description}
        sx={{ fontSize: '0.65rem' }}
      />
    );
  };

  // Loading skeleton
  const FormCardSkeleton = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="rounded" width={60} height={20} />
        </Box>
      </CardContent>
      <CardActions>
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={100} height={32} />
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            RTF Formulare
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verwaltung und Bearbeitung der RTF-Meldungen ({totalForms} verfügbar)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={() => setNewFormDialogOpen(true)}
          >
            Neues Formular
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dependency hint when DBL Berichtsumfang not yet set */}
      {berichtsumfang === undefined && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Füllen Sie im <strong>DBL-Vordruck</strong> das Feld <strong>Berichtsumfang</strong> aus, um zu sehen, welche Formulare für Ihr Institut relevant sind (GRP/STA nur bei zusammengefasster Meldung).
        </Alert>
      )}
      {berichtsumfang !== undefined && berichtsumfang !== 'x02' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Berichtsumfang: <strong>Einzelinstitut</strong> — GRP und STA sind für diese Meldung nicht erforderlich.
        </Alert>
      )}
      {berichtsumfang === 'x02' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Berichtsumfang: <strong>Zusammengefasste Meldung</strong> — GRP und STA sind einzureichen.
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Formulare suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value as FormStatus)}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="draft">Entwurf</MenuItem>
                <MenuItem value="in_review">In Prüfung</MenuItem>
                <MenuItem value="submitted">Eingereicht</MenuItem>
                <MenuItem value="completed">Abgeschlossen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Berichtszeitraum</InputLabel>
              <Select
                value={selectedPeriod}
                label="Berichtszeitraum"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="">Alle</MenuItem>
                {reportingPeriods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(FORM_CATEGORY_NAMES_DE).slice(0, 4).map(([key, name]) => (
                <Chip
                  key={key}
                  label={name}
                  variant={selectedCategory === key ? 'filled' : 'outlined'}
                  size="small"
                  clickable
                  onClick={() => handleCategoryFilter(key)}
                  color={selectedCategory === key ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Forms Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <FormCardSkeleton />
            </Grid>
          ))
        ) : forms.length === 0 ? (
          // No forms found
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Keine Formulare gefunden
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Versuchen Sie, Ihre Suchkriterien anzupassen oder erstellen Sie ein neues Formular.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ mt: 2 }}
                onClick={() => setNewFormDialogOpen(true)}
              >
                Erstes Formular erstellen
              </Button>
            </Paper>
          </Grid>
        ) : (
          // Form cards
          forms.map((form) => (
            <Grid item xs={12} md={6} lg={4} key={`${form.id}-${form.reportingPeriod}`}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" component="h3" gutterBottom noWrap>
                        {form.code}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {form.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(form.status)}
                      color={getStatusColor(form.status)}
                      size="small"
                      sx={{ ml: 1, flexShrink: 0 }}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Letzte Änderung: {formatDate(form.lastModified)}
                    </Typography>
                    {form.reportingPeriod && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Berichtszeitraum: {form.reportingPeriod}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        <Chip label={form.category} size="small" variant="outlined" />
                        {getDependencyBadge(form)}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        v{form.version}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Assessment />}
                    component={RouterLink}
                    to={`/forms/${form.id}`}
                  >
                    Anzeigen
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    component={RouterLink}
                    to={`/forms/${form.id}/edit/${form.reportingPeriod || '2024-12-31'}`}
                  >
                    Bearbeiten
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {!loading && forms.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* New Form Dialog */}
      <NewFormDialog
        open={newFormDialogOpen}
        onClose={() => setNewFormDialogOpen(false)}
        onCreateForm={handleCreateForm}
        availableForms={availableForms}
        reportingPeriods={reportingPeriods}
      />
    </Box>
  );
};

export default FormsPage;