// RTF Reporting Tool - User Management Page
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Stack,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Edit,
  LockReset,
  PersonOff,
  PersonAdd,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import { selectUser } from '../../store/slices/authSlice';
import { usersApi, UserData, CreateUserPayload, UpdateUserPayload } from '../../services/usersApi';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  compliance_officer: 'Compliance Officer',
  risk_manager: 'Risikomanager',
  data_entry: 'Dateneingabe',
  reviewer: 'Prüfer',
  viewer: 'Lesezugriff'
};

const ROLE_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default' | 'success'> = {
  admin: 'error',
  compliance_officer: 'warning',
  risk_manager: 'info',
  data_entry: 'default',
  reviewer: 'success',
  viewer: 'default'
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Vollzugriff inkl. Benutzerverwaltung',
  compliance_officer: 'Formulare einreichen, Benutzer verwalten',
  risk_manager: 'Formulare bearbeiten und validieren',
  data_entry: 'Formulardaten erfassen',
  reviewer: 'Formulare prüfen und kommentieren',
  viewer: 'Nur lesen'
};

// ── Create / Edit Dialog ──────────────────────────────────────────────────────

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (user: UserData) => void;
  editUser?: UserData | null;
  currentUserRole: string;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, onSaved, editUser, currentUserRole }) => {
  const isEdit = !!editUser;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', firstName: '', lastName: '', role: 'data_entry', password: ''
  });

  useEffect(() => {
    if (open) {
      setError(null);
      setShowPassword(false);
      setForm(editUser
        ? { username: editUser.username, email: editUser.email, firstName: editUser.firstName, lastName: editUser.lastName, role: editUser.role, password: '' }
        : { username: '', email: '', firstName: '', lastName: '', role: 'data_entry', password: '' }
      );
    }
  }, [open, editUser]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.role) {
      setError('Bitte alle Pflichtfelder ausfüllen'); return;
    }
    if (!isEdit && (!form.username || !form.password)) {
      setError('Benutzername und Passwort sind erforderlich'); return;
    }
    setSaving(true); setError(null);
    try {
      let saved: UserData;
      if (isEdit && editUser) {
        const payload: UpdateUserPayload = { role: form.role, firstName: form.firstName, lastName: form.lastName, email: form.email };
        saved = await usersApi.updateUser(editUser.id, payload);
      } else {
        saved = await usersApi.createUser(form as CreateUserPayload);
      }
      onSaved(saved); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const availableRoles = Object.keys(ROLE_LABELS).filter(r => currentUserRole === 'admin' || r !== 'admin');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField fullWidth label="Vorname" required value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <TextField fullWidth label="Nachname" required value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </Stack>
          <TextField fullWidth label="E-Mail" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          {!isEdit && (
            <TextField fullWidth label="Benutzername" required value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              helperText="Eindeutiger Anmeldename, nicht änderbar" />
          )}
          <FormControl fullWidth required>
            <InputLabel>Rolle</InputLabel>
            <Select value={form.role} label="Rolle" onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {availableRoles.map(role => (
                <MenuItem key={role} value={role}>
                  <Box>
                    <Typography variant="body2">{ROLE_LABELS[role]}</Typography>
                    <Typography variant="caption" color="text.secondary">{ROLE_DESCRIPTIONS[role]}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isEdit && (
            <TextField
              fullWidth label="Passwort" required
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              helperText="Mindestens 8 Zeichen"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(s => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {isEdit ? 'Speichern' : 'Erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Reset Password Dialog ─────────────────────────────────────────────────────

const ResetPasswordDialog: React.FC<{ open: boolean; onClose: () => void; user: UserData | null }> = ({ open, onClose, user }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => { if (open) { setPassword(''); setError(null); setDone(false); } }, [open]);

  const handleReset = async () => {
    if (password.length < 8) { setError('Mindestens 8 Zeichen'); return; }
    setSaving(true); setError(null);
    try {
      await usersApi.resetPassword(user!.id, password);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Fehler');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Passwort zurücksetzen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {done
            ? <Alert severity="success">Passwort für <strong>{user?.firstName} {user?.lastName}</strong> wurde gesetzt.</Alert>
            : <>
                {error && <Alert severity="error">{error}</Alert>}
                <Typography variant="body2" color="text.secondary">
                  Neues Passwort für <strong>{user?.firstName} {user?.lastName}</strong>:
                </Typography>
                <TextField
                  fullWidth label="Neues Passwort"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  helperText="Mindestens 8 Zeichen"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(s => !s)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </>
          }
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{done ? 'Schließen' : 'Abbrechen'}</Button>
        {!done && (
          <Button variant="contained" onClick={handleReset} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LockReset />}>
            Zurücksetzen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const UsersPage: React.FC = () => {
  const currentUser = useAppSelector(selectUser);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserData | null>(null);
  const [resetTarget, setResetTarget] = useState<UserData | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'compliance_officer';
  const isAdmin = currentUser?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setUsers(await usersApi.listUsers()); }
    catch (err: any) { setError(err.response?.data?.message || err.message || 'Fehler beim Laden'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (saved: UserData) =>
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...prev[idx], ...saved }; return n; }
      return [saved, ...prev];
    });

  const handleToggleActive = async (u: UserData) => {
    try {
      if (u.isActive) {
        await usersApi.deactivateUser(u.id);
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: false } : x));
      } else {
        const updated = await usersApi.updateUser(u.id, { isActive: true });
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x));
      }
    } catch (err: any) { setError(err.response?.data?.message || err.message || 'Fehler'); }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Benutzerverwaltung</Typography>
          <Typography variant="body1" color="text.secondary">
            {users.filter(u => u.isActive).length} aktive · {users.length} gesamt
          </Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<PersonAdd />}
            onClick={() => { setEditTarget(null); setDialogOpen(true); }}>
            Neuer Benutzer
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Benutzername</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell>Letzter Login</TableCell>
                <TableCell>Status</TableCell>
                {canEdit && <TableCell align="right">Aktionen</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} sx={{ opacity: u.isActive ? 1 : 0.5 }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {u.firstName} {u.lastName}
                      {u.id === currentUser?.id && (
                        <Chip label="Ich" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">{u.username}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                  <TableCell>
                    <Tooltip title={ROLE_DESCRIPTIONS[u.role] ?? ''}>
                      <Chip label={ROLE_LABELS[u.role] ?? u.role} color={ROLE_COLORS[u.role] ?? 'default'} size="small" />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{formatDate(u.lastLogin)}</Typography>
                  </TableCell>
                  <TableCell>
                    {canEdit && u.id !== currentUser?.id ? (
                      <Tooltip title={u.isActive ? 'Deaktivieren' : 'Aktivieren'}>
                        <Switch checked={u.isActive} onChange={() => handleToggleActive(u)} size="small"
                          disabled={!isAdmin && !u.isActive} />
                      </Tooltip>
                    ) : (
                      <Chip label={u.isActive ? 'Aktiv' : 'Inaktiv'} color={u.isActive ? 'success' : 'default'}
                        size="small" variant="outlined" />
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      {u.id !== currentUser?.id && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Bearbeiten">
                            <IconButton size="small" onClick={() => { setEditTarget(u); setDialogOpen(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Passwort zurücksetzen">
                            <IconButton size="small" onClick={() => { setResetTarget(u); setResetDialogOpen(true); }}>
                              <LockReset fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {isAdmin && u.isActive && (
                            <Tooltip title="Deaktivieren">
                              <IconButton size="small" color="error" onClick={() => handleToggleActive(u)}>
                                <PersonOff fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Role legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Rollenübersicht</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <Tooltip key={role} title={ROLE_DESCRIPTIONS[role]}>
              <Chip label={label} color={ROLE_COLORS[role]} size="small" />
            </Tooltip>
          ))}
        </Stack>
      </Paper>

      <UserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={handleSaved}
        editUser={editTarget} currentUserRole={currentUser?.role ?? 'viewer'} />

      <ResetPasswordDialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} user={resetTarget} />
    </Box>
  );
};

export default UsersPage;
