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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Business,
  AccountBalance,
  Settings,
  CheckCircle
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectInstitution, selectUser, updateInstitution } from '../../store/slices/authSlice';
import api from '../../services/api';

const ACCOUNTING_STANDARD_LABELS: Record<string, string> = {
  hgb: 'HGB (Handelsgesetzbuch)',
  ifrs: 'IFRS (International Financial Reporting Standards)',
  hgb_and_ifrs: 'HGB und IFRS'
};

const ACCOUNTING_STANDARD_HINTS: Record<string, string> = {
  hgb: 'Einzureichen: RDP-BH',
  ifrs: 'Einzureichen: RDP-BI',
  hgb_and_ifrs: 'Einzureichen: RDP-BH und RDP-BI'
};

const INSTITUTE_TYPE_LABELS: Record<string, string> = {
  bank: 'Kreditbank',
  savings_bank: 'Sparkasse',
  cooperative_bank: 'Genossenschaftsbank',
  building_society: 'Bausparkasse',
  investment_firm: 'Wertpapierfirma',
  other: 'Sonstiges'
};

const institutionSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().default('DE'),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Ungültige E-Mail-Adresse').or(z.literal('')).optional(),
  contactPhone: z.string().optional(),
  isConsolidatedReporting: z.boolean().default(false),
  accountingStandard: z.enum(['hgb', 'ifrs', 'hgb_and_ifrs']).default('hgb')
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3, px: 1 }}>{children}</Box>}
  </div>
);

const InstitutionPage: React.FC = () => {
  const institution = useAppSelector(selectInstitution) as any;
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: institution?.name ?? '',
      addressStreet: institution?.addressStreet ?? '',
      addressCity: institution?.addressCity ?? '',
      addressPostalCode: institution?.addressPostalCode ?? '',
      addressCountry: institution?.addressCountry ?? 'DE',
      contactPerson: institution?.contactPerson ?? '',
      contactEmail: institution?.contactEmail ?? '',
      contactPhone: institution?.contactPhone ?? '',
      isConsolidatedReporting: institution?.isConsolidatedReporting ?? false,
      accountingStandard: institution?.accountingStandard ?? 'hgb'
    }
  });

  // Re-populate form when institution loads from Redux
  useEffect(() => {
    if (institution) {
      reset({
        name: institution.name ?? '',
        addressStreet: institution.addressStreet ?? '',
        addressCity: institution.addressCity ?? '',
        addressPostalCode: institution.addressPostalCode ?? '',
        addressCountry: institution.addressCountry ?? 'DE',
        contactPerson: institution.contactPerson ?? '',
        contactEmail: institution.contactEmail ?? '',
        contactPhone: institution.contactPhone ?? '',
        isConsolidatedReporting: institution.isConsolidatedReporting ?? false,
        accountingStandard: institution.accountingStandard ?? 'hgb'
      });
    }
  }, [institution, reset]);

  const watchedStandard = watch('accountingStandard');
  const watchedConsolidated = watch('isConsolidatedReporting');

  const canEdit = user?.role === 'admin' || user?.role === 'compliance_officer';

  const onSubmit = async (data: InstitutionFormData) => {
    if (!institution?.id) return;
    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await api.put(`/institutions/${institution.id}`, data);
      const updated = res.data?.data;

      dispatch(updateInstitution({
        ...data,
        isConsolidatedReporting: updated?.isConsolidatedReporting ?? data.isConsolidatedReporting,
        accountingStandard: updated?.accountingStandard ?? data.accountingStandard
      } as any));

      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || 'Speichern fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditMode(false);
    setSaveError(null);
  };

  if (!institution) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Institution</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Stammdaten, Meldeumfang und Rechnungslegungsstandard Ihres Instituts
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Daten erfolgreich gespeichert.
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>{institution.name}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<Business />}
                  label={INSTITUTE_TYPE_LABELS[institution.instituteType] ?? institution.instituteType}
                  variant="outlined"
                  size="small"
                />
                <Chip icon={<CheckCircle />} label="Aktiv" color="success" variant="outlined" size="small" />
                <Chip
                  icon={<AccountBalance />}
                  label={institution.isConsolidatedReporting ? 'Zusammengefasste Meldung' : 'Einzelinstitut'}
                  color={institution.isConsolidatedReporting ? 'info' : 'default'}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={ACCOUNTING_STANDARD_LABELS[institution.accountingStandard] ?? institution.accountingStandard}
                  variant="outlined"
                  size="small"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                BIK: {institution.bik} · Land: {institution.addressCountry ?? 'DE'}
              </Typography>
            </Box>
            <Box>
              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  disabled={!canEdit}
                >
                  Bearbeiten
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel}>
                    Abbrechen
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
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

      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Business />} iconPosition="start" label="Stammdaten" />
          <Tab icon={<Settings />} iconPosition="start" label="Meldeumfang &amp; Rechnungslegung" />
        </Tabs>

        {/* ── Tab 0: Stammdaten ── */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Institutsname"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={!editMode}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="BIK (Bankleitzahl)"
                value={institution.bik}
                disabled
                helperText="Nicht änderbar"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Institutstyp"
                value={INSTITUTE_TYPE_LABELS[institution.instituteType] ?? institution.instituteType}
                disabled
                helperText="Nicht änderbar"
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Adresse</Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="addressStreet"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Straße und Hausnummer" disabled={!editMode} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="addressPostalCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="PLZ" disabled={!editMode} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Controller
                name="addressCity"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Stadt" disabled={!editMode} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="addressCountry"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Land" disabled={!editMode} />
                )}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Kontakt</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Ansprechpartner" disabled={!editMode} />
                )}
              />
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
                  <TextField {...field} fullWidth label="Telefon" disabled={!editMode} />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* ── Tab 1: Meldeumfang & Rechnungslegung ── */}
        <TabPanel value={activeTab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Diese Einstellungen bestimmen automatisch, welche RTF-Vordrucke für Ihr Institut einzureichen sind.
            Sie wirken sich sofort auf die Formularübersicht aus.
          </Alert>

          <Grid container spacing={4}>
            {/* Meldeumfang */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Meldeumfang
              </Typography>
              <Controller
                name="isConsolidatedReporting"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={!editMode}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Zusammengefasste Meldung</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Für Institutsgruppen, Finanzholdinggruppen und gemischte Finanzholdinggruppen
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
              <Box sx={{ mt: 2 }}>
                <Chip
                  size="small"
                  color={watchedConsolidated ? 'info' : 'default'}
                  label={watchedConsolidated
                    ? 'GRP und STA sind einzureichen'
                    : 'GRP und STA entfallen (Einzelinstitut)'}
                />
              </Box>
            </Grid>

            {/* Rechnungslegungsstandard */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Rechnungslegungsstandard
              </Typography>
              <Controller
                name="accountingStandard"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Rechnungslegungsstandard</InputLabel>
                    <Select {...field} label="Rechnungslegungsstandard">
                      {Object.entries(ACCOUNTING_STANDARD_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          <Box>
                            <Typography variant="body2">{label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ACCOUNTING_STANDARD_HINTS[value]}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Box sx={{ mt: 2 }}>
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={ACCOUNTING_STANDARD_HINTS[watchedStandard ?? 'hgb']}
                />
              </Box>
            </Grid>

            {/* Zusammenfassung */}
            <Grid item xs={12}>
              <Divider />
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Daraus ergibt sich folgender Meldeumfang:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['DBL', 'RTFK', 'STG', 'KPL', 'ILAAP'].map(f => (
                    <Chip key={f} label={f} size="small" color="success" />
                  ))}
                  {watchedConsolidated && ['GRP', 'STA'].map(f => (
                    <Chip key={f} label={f} size="small" color="info" />
                  ))}
                  {['STKK', 'RSK', 'RDP-R'].map(f => (
                    <Chip key={f} label={f} size="small" color="warning" variant="outlined" />
                  ))}
                  {(watchedStandard === 'hgb' || watchedStandard === 'hgb_and_ifrs') && (
                    <Chip label="RDP-BH" size="small" color="warning" variant="outlined" />
                  )}
                  {(watchedStandard === 'ifrs' || watchedStandard === 'hgb_and_ifrs') && (
                    <Chip label="RDP-BI" size="small" color="warning" variant="outlined" />
                  )}
                  <Chip label="RDP-BW" size="small" color="warning" variant="outlined" />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Grün = Pflicht · Blau = nur zusammengefasste Basis · Orange = je Steuerungskreis
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default InstitutionPage;
