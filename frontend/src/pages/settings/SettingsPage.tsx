// RTF Reporting Tool - Settings / Institution Master Data
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { Save, Business, AccountBalance } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectInstitution, updateInstitution } from '../../store/slices/authSlice';
import api from '../../services/api';

const ACCOUNTING_STANDARD_LABELS: Record<string, string> = {
  hgb: 'HGB (Handelsgesetzbuch)',
  ifrs: 'IFRS (International Financial Reporting Standards)',
  hgb_and_ifrs: 'HGB und IFRS'
};

const ACCOUNTING_STANDARD_HINTS: Record<string, string> = {
  hgb: 'RDP-BH ist einzureichen.',
  ifrs: 'RDP-BI ist einzureichen.',
  hgb_and_ifrs: 'Sowohl RDP-BH als auch RDP-BI sind einzureichen.'
};

const INSTITUTE_TYPE_LABELS: Record<string, string> = {
  bank: 'Kreditbank',
  savings_bank: 'Sparkasse',
  cooperative_bank: 'Genossenschaftsbank',
  building_society: 'Bausparkasse',
  investment_firm: 'Wertpapierfirma',
  other: 'Sonstiges'
};

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const institution = useSelector(selectInstitution) as any;

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    isConsolidatedReporting: false,
    accountingStandard: 'hgb' as 'hgb' | 'ifrs' | 'hgb_and_ifrs',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
    addressCountry: 'DE'
  });

  useEffect(() => {
    if (institution) {
      setForm({
        name: institution.name ?? '',
        isConsolidatedReporting: institution.isConsolidatedReporting ?? false,
        accountingStandard: institution.accountingStandard ?? 'hgb',
        contactPerson: institution.contactPerson ?? '',
        contactEmail: institution.contactEmail ?? '',
        contactPhone: institution.contactPhone ?? '',
        addressStreet: institution.addressStreet ?? '',
        addressCity: institution.addressCity ?? '',
        addressPostalCode: institution.addressPostalCode ?? '',
        addressCountry: institution.addressCountry ?? 'DE'
      });
    }
  }, [institution]);

  const handleSave = async () => {
    if (!institution?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.put(`/institutions/${institution.id}`, form);
      const updated = res.data?.data;

      // Update Redux store so FormsPage reflects new values immediately
      dispatch(updateInstitution({
        ...form,
        isConsolidatedReporting: updated?.isConsolidatedReporting ?? form.isConsolidatedReporting,
        accountingStandard: updated?.accountingStandard ?? form.accountingStandard
      } as any));

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
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
      <Typography variant="h4" gutterBottom>Einstellungen</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Stammdaten Ihres Instituts — diese Informationen bestimmen den Meldeumfang.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          Stammdaten erfolgreich gespeichert.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Meldeumfang */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AccountBalance color="primary" />
              <Typography variant="h6">Meldeumfang &amp; Rechnungslegung</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Diese Angaben bestimmen automatisch, welche RTF-Vordrucke für Ihr Institut einzureichen sind.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isConsolidatedReporting}
                      onChange={e => setForm(f => ({ ...f, isConsolidatedReporting: e.target.checked }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Zusammengefasste Meldung</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aktivieren für Institutsgruppen, Finanzholdinggruppen und gemischte Finanzholdinggruppen
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    color={form.isConsolidatedReporting ? 'info' : 'default'}
                    label={form.isConsolidatedReporting
                      ? 'GRP und STA sind einzureichen'
                      : 'GRP und STA entfallen'}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rechnungslegungsstandard</InputLabel>
                  <Select
                    value={form.accountingStandard}
                    label="Rechnungslegungsstandard"
                    onChange={e => setForm(f => ({ ...f, accountingStandard: e.target.value as any }))}
                  >
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
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label={ACCOUNTING_STANDARD_HINTS[form.accountingStandard]}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Stammdaten */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h6">Institutsstammdaten</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Institutsname"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="BIK (Bankleitzahl)"
                  value={institution.bik}
                  disabled
                  helperText="Nicht änderbar"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Institutstyp"
                  value={INSTITUTE_TYPE_LABELS[institution.instituteType] ?? institution.instituteType}
                  disabled
                  helperText="Nicht änderbar"
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ansprechpartner"
                  value={form.contactPerson}
                  onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={form.contactPhone}
                  onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Straße und Hausnummer"
                  value={form.addressStreet}
                  onChange={e => setForm(f => ({ ...f, addressStreet: e.target.value }))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="PLZ"
                  value={form.addressPostalCode}
                  onChange={e => setForm(f => ({ ...f, addressPostalCode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Stadt"
                  value={form.addressCity}
                  onChange={e => setForm(f => ({ ...f, addressCity: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              Speichern
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
