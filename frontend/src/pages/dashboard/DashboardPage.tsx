// RTF Reporting Tool - Dashboard Page
import React, { useEffect, useState, useCallback } from 'react';
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
  IconButton,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Assessment,
  Download,
  Edit,
  Visibility,
  HourglassEmpty,
  Send
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import { useAppSelector } from '../../store';
import { selectUser, selectInstitution } from '../../store/slices/authSlice';
import { FORM_CATEGORY_NAMES_DE } from '@rtf-tool/shared';
import { formsApi, FormListItem } from '../../services/formsApi';
import { getFormApplicability, AccountingStandard } from '../../utils/formDependencies';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  in_review: 'In Prüfung',
  submitted: 'Eingereicht',
  accepted: 'Akzeptiert',
  rejected: 'Abgelehnt'
};

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  in_review: 'warning',
  submitted: 'info',
  accepted: 'success',
  rejected: 'error'
};

const CATEGORY_ORDER = ['DBL', 'GRP', 'STA', 'RTFK', 'STKK', 'RSK', 'RDP', 'STG', 'KPL', 'ILAAP'] as const;

function getStatusIcon(status: string) {
  switch (status) {
    case 'draft': return <Assignment fontSize="small" />;
    case 'in_review': return <HourglassEmpty fontSize="small" />;
    case 'submitted': return <Send fontSize="small" />;
    case 'accepted': return <CheckCircle fontSize="small" color="success" />;
    default: return <Edit fontSize="small" />;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

interface DashboardStats {
  applicableTotal: number;
  withInstance: number;
  byStatus: Record<string, number>;
  byCategory: Array<{ category: string; name: string; applicable: number; withInstance: number }>;
  recentActivity: FormListItem[];
}

function computeStats(
  forms: FormListItem[],
  isConsolidated: boolean | undefined,
  accountingStandard: AccountingStandard | undefined
): DashboardStats {
  // Forms applicable to this institution
  const applicable = forms.filter(f =>
    getFormApplicability(f.code, isConsolidated, accountingStandard) !== 'not_applicable'
  );

  // Forms with an actual saved instance (reportingPeriod is set by backend only when instance exists)
  const withInstanceForms = applicable.filter(f => f.reportingPeriod != null);

  // Status breakdown (only among forms with instances)
  const byStatus: Record<string, number> = {};
  for (const f of withInstanceForms) {
    byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
  }

  // Category breakdown
  const byCategory = CATEGORY_ORDER
    .map(cat => {
      const catName = (FORM_CATEGORY_NAMES_DE as any)[cat] ?? cat;
      const catApplicable = applicable.filter(f => f.category === cat);
      const catWithInstance = catApplicable.filter(f => f.reportingPeriod != null);
      if (catApplicable.length === 0) return null;
      return { category: cat, name: catName, applicable: catApplicable.length, withInstance: catWithInstance.length };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Recent activity: forms with instances sorted by lastModified DESC, take top 6
  const recentActivity = [...withInstanceForms]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 6);

  return {
    applicableTotal: applicable.length,
    withInstance: withInstanceForms.length,
    byStatus,
    byCategory,
    recentActivity
  };
}

const DashboardPage: React.FC = () => {
  const user = useAppSelector(selectUser);
  const institution = useAppSelector(selectInstitution);

  const isConsolidated: boolean | undefined = institution
    ? ((institution as any).isConsolidatedReporting ?? false)
    : undefined;
  const accountingStandard: AccountingStandard | undefined =
    (institution as any)?.accountingStandard ?? undefined;

  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await formsApi.getFormDefinitions({ limit: 500 });
      setForms(res.forms);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Formulardaten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadForms(); }, [loadForms]);

  const stats = computeStats(forms, isConsolidated, accountingStandard);
  const completionPct = stats.applicableTotal > 0
    ? Math.round((stats.withInstance / stats.applicableTotal) * 100)
    : 0;
  const draftCount = stats.byStatus['draft'] ?? 0;
  const submittedCount = (stats.byStatus['submitted'] ?? 0) + (stats.byStatus['accepted'] ?? 0);

  const StatSkeleton = () => (
    <Card><CardContent>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={24} />
      <Skeleton variant="rectangular" height={8} sx={{ mt: 2, borderRadius: 4 }} />
    </CardContent></Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Dashboard</Typography>
        {user && (
          <Typography variant="h6" color="text.secondary">
            Willkommen zurück, {user.firstName} {user.lastName}
          </Typography>
        )}
        {institution && (
          <Typography variant="body2" color="text.secondary">
            {institution.name}{institution.bik ? ` · BIK ${institution.bik}` : ''}
            {' · '}
            {isConsolidated ? 'Zusammengefasste Meldung' : 'Einzelinstitut'}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Completion Progress */}
            <Grid item xs={12} sm={6}>
              {loading ? <StatSkeleton /> : (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Assignment color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="h6">Formular-Fortschritt</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stats.withInstance} von {stats.applicableTotal} begonnen
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={completionPct}
                      sx={{ mb: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {completionPct}% gestartet
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Draft count */}
            <Grid item xs={12} sm={6}>
              {loading ? <StatSkeleton /> : (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HourglassEmpty color="warning" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="h6">Offene Entwürfe</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Formulare in Bearbeitung
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h3" color={draftCount > 0 ? 'warning.main' : 'text.secondary'}>
                      {draftCount}
                    </Typography>
                    <Button
                      size="small"
                      component={RouterLink}
                      to="/forms?status=draft"
                      sx={{ mt: 1 }}
                      disabled={draftCount === 0}
                    >
                      Entwürfe anzeigen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Submitted count */}
            <Grid item xs={12} sm={6}>
              {loading ? <StatSkeleton /> : (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="h6">Eingereicht</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Abgeschlossen / akzeptiert
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h3" color={submittedCount > 0 ? 'success.main' : 'text.secondary'}>
                      {submittedCount}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Schnellaktionen</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="outlined" startIcon={<Edit />} component={RouterLink} to="/forms" fullWidth>
                      Alle Formulare
                    </Button>
                    <Button variant="outlined" startIcon={<Download />} component={RouterLink} to="/xbrl" fullWidth>
                      XBRL exportieren
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Assessment />}
                      component={RouterLink}
                      to="/forms?status=draft"
                      fullWidth
                      disabled={draftCount === 0}
                    >
                      Entwürfe anzeigen ({draftCount})
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
            <Typography variant="h6" gutterBottom>Letzte Aktivitäten</Typography>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ py: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="50%" />
                  {i < 2 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))
            ) : stats.recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Noch keine Formulare bearbeitet
              </Typography>
            ) : (
              <List dense>
                {stats.recentActivity.map((form, index) => (
                  <React.Fragment key={`${form.id}-${form.reportingPeriod}`}>
                    <ListItem
                      sx={{ px: 0 }}
                      secondaryAction={
                        <IconButton edge="end" size="small" component={RouterLink} to={`/forms/${form.id}`}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getStatusIcon(form.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.code}</Typography>
                            <Chip
                              label={STATUS_LABELS[form.status] ?? form.status}
                              size="small"
                              color={STATUS_COLORS[form.status] ?? 'default'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption">
                            {form.reportingPeriod} · {formatDateTime(form.lastModified)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <Button size="small" component={RouterLink} to="/forms" sx={{ mt: 1 }}>
              Alle anzeigen
            </Button>
          </Paper>

          {/* Category Progress */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Fortschritt nach Kategorie</Typography>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ py: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="rectangular" height={6} sx={{ mt: 0.5, borderRadius: 3 }} />
                  {i < 3 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))
            ) : stats.byCategory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Keine relevanten Kategorien
              </Typography>
            ) : (
              <List dense>
                {stats.byCategory.map((cat, index) => {
                  const pct = cat.applicable > 0 ? Math.round((cat.withInstance / cat.applicable) * 100) : 0;
                  return (
                    <React.Fragment key={cat.category}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cat.withInstance}/{cat.applicable}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ height: 6, borderRadius: 3 }}
                              color={pct === 100 ? 'success' : 'primary'}
                            />
                          }
                        />
                      </ListItem>
                      {index < stats.byCategory.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
            {!isConsolidated && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                GRP/STA-Vordrucke entfallen (Einzelinstitut)
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
