// RTF Reporting Tool - Institution Management Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Business,
  Security,
  Settings,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
  Add,
  Delete,
  History
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector } from '../../store';
import { selectInstitution, selectUser } from '../../store/slices/authSlice';

// Institution data schema
const institutionSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  bik: z.string().regex(/^[A-Z0-9]{8,11}$/, 'Ungültige BIC/BLZ Format'),
  instituteType: z.string().min(1, 'Institutstyp ist erforderlich'),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().default('DE'),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  reportingContact: z.string().optional(),
  reportingEmail: z.string().email().optional(),
  supervisoryAuthority: z.string().optional()
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

// Exemption/Befreiung data
interface Exemption {
  id: string;
  formCode: string;
  formName: string;
  exemptionType: 'complete' | 'partial';
  validFrom: string;
  validTo?: string;
  reason: string;
  isActive: boolean;
}

const InstitutionPage: React.FC = () => {
  const institution = useAppSelector(selectInstitution);
  const user = useAppSelector(selectUser);

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exemptions, setExemptions] = useState<Exemption[]>([]);
  const [exemptionDialogOpen, setExemptionDialogOpen] = useState(false);

  // Form handling
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: institution?.name || '',
      bik: institution?.bik || '',
      instituteType: institution?.instituteType || '',
      addressStreet: institution?.addressStreet || '',
      addressCity: institution?.addressCity || '',
      addressPostalCode: institution?.addressPostalCode || '',
      addressCountry: institution?.addressCountry || 'DE',
      contactEmail: institution?.contactEmail || '',
      contactPhone: institution?.contactPhone || '',
      reportingContact: institution?.reportingContact || '',
      reportingEmail: institution?.reportingEmail || '',
      supervisoryAuthority: institution?.supervisoryAuthority || 'Deutsche Bundesbank'
    }
  });

  // Load exemptions data
  useEffect(() => {
    const loadExemptions = async () => {
      // Mock exemptions data
      const mockExemptions: Exemption[] = [
        {
          id: 'ex-1',
          formCode: 'GRP31',
          formName: 'Unternehmen mit Freistellung nach § 2a',
          exemptionType: 'complete',
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          reason: 'Kleininstitut nach § 2a KWG',
          isActive: true
        },
        {
          id: 'ex-2',
          formCode: 'RSK12',
          formName: 'Adressenausfallrisiko - Kredite',
          exemptionType: 'partial',
          validFrom: '2024-01-01',
          reason: 'Vereinfachtes Verfahren für Sparkassen',
          isActive: true
        }
      ];
      setExemptions(mockExemptions);
    };

    loadExemptions();
  }, []);

  // Event handlers
  const onSubmit = async (data: InstitutionFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      console.log('Saving institution data:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEditMode(false);
      setError(null);

      // TODO: Update Redux store with new data
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Institutsdaten');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditMode(false);
    setError(null);
  };

  const handleAddExemption = () => {
    setExemptionDialogOpen(true);
  };

  const toggleExemption = (exemptionId: string) => {
    setExemptions(prev => prev.map(ex =>
      ex.id === exemptionId ? { ...ex, isActive: !ex.isActive } : ex
    ));
  };

  const deleteExemption = (exemptionId: string) => {
    setExemptions(prev => prev.filter(ex => ex.id !== exemptionId));
  };

  // Tab panels
  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Institutsverwaltung
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Verwaltung der Institutsdaten und Befreiungen für RTF-Meldungen
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Institution Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                {institution?.name || 'Institution Name'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  icon={<Business />}
                  label={institution?.instituteType || 'Institutstyp'}
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Aktiv"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${exemptions.filter(ex => ex.isActive).length} Befreiungen`}
                  color="info"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                BIC/BLZ: {institution?.bik || 'Nicht angegeben'} •
                Land: {institution?.addressCountry || 'DE'}
              </Typography>
            </Box>
            <Box>
              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  disabled={user?.role !== 'admin' && user?.role !== 'compliance_officer'}
                >
                  Bearbeiten
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading || !isDirty}
                  >
                    Speichern
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Business />} label="Stammdaten" />
          <Tab icon={<Security />} label="Befreiungen" />
          <Tab icon={<Settings />} label="Einstellungen" />
        </Tabs>

        {/* Stammdaten Tab */}
        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Grunddaten */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Grunddaten
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Institutionsname"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={!editMode}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="bik"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="BIC/Bankleitzahl"
                      error={!!errors.bik}
                      helperText={errors.bik?.message}
                      disabled={!editMode}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="instituteType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={!editMode}>
                      <InputLabel>Institutstyp</InputLabel>
                      <Select {...field} label="Institutstyp">
                        <MenuItem value="Kreditinstitut">Kreditinstitut</MenuItem>
                        <MenuItem value="Sparkasse">Sparkasse</MenuItem>
                        <MenuItem value="Genossenschaftsbank">Genossenschaftsbank</MenuItem>
                        <MenuItem value="Landesbank">Landesbank</MenuItem>
                        <MenuItem value="Privatbank">Privatbank</MenuItem>
                        <MenuItem value="Bausparkasse">Bausparkasse</MenuItem>
                        <MenuItem value="Sonstiges">Sonstiges</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="supervisoryAuthority"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Aufsichtsbehörde"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              {/* Adresse */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Adresse
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Controller
                  name="addressStreet"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Straße und Hausnummer"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="addressPostalCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Postleitzahl"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="addressCity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Stadt"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="addressCountry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Land"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              {/* Kontakt */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kontaktdaten
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="contactEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="E-Mail"
                      type="email"
                      error={!!errors.contactEmail}
                      helperText={errors.contactEmail?.message}
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="contactPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Telefon"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="reportingContact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ansprechpartner Meldewesen"
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="reportingEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="E-Mail Meldewesen"
                      type="email"
                      error={!!errors.reportingEmail}
                      helperText={errors.reportingEmail?.message}
                      disabled={!editMode}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Befreiungen Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">
              Befreiungen ({exemptions.filter(ex => ex.isActive).length} aktiv)
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddExemption}
              disabled={user?.role !== 'admin' && user?.role !== 'compliance_officer'}
            >
              Neue Befreiung
            </Button>
          </Box>

          {exemptions.length === 0 ? (
            <Alert severity="info">
              Keine Befreiungen konfiguriert.
            </Alert>
          ) : (
            exemptions.map((exemption) => (
              <Accordion key={exemption.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="subtitle1">
                      {exemption.formCode} - {exemption.formName}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip
                      label={exemption.exemptionType === 'complete' ? 'Vollständig' : 'Teilweise'}
                      color={exemption.exemptionType === 'complete' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={exemption.isActive ? 'Aktiv' : 'Inaktiv'}
                      color={exemption.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gültig von: {new Date(exemption.validFrom).toLocaleDateString('de-DE')}
                      </Typography>
                      {exemption.validTo && (
                        <Typography variant="body2" color="text.secondary">
                          Gültig bis: {new Date(exemption.validTo).toLocaleDateString('de-DE')}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" paragraph>
                        <strong>Begründung:</strong> {exemption.reason}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" gap={1} alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={exemption.isActive}
                              onChange={() => toggleExemption(exemption.id)}
                            />
                          }
                          label="Aktiv"
                        />
                        <Tooltip title="Befreiung löschen">
                          <IconButton
                            onClick={() => deleteExemption(exemption.id)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </TabPanel>

        {/* Einstellungen Tab */}
        <TabPanel value={activeTab} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Systemeinstellungen werden in einer späteren Version verfügbar sein.
          </Alert>

          <Typography variant="h6" gutterBottom>
            Systemeinstellungen
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText
                primary="Audit-Protokoll"
                secondary="Übersicht über alle Änderungen und Aktivitäten"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Sicherheitseinstellungen"
                secondary="Passwort-Richtlinien und Zugriffskontrollen"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="System-Konfiguration"
                secondary="Allgemeine Systemeinstellungen"
              />
            </ListItem>
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default InstitutionPage;