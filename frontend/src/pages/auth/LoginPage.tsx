// RTF Reporting Tool - Login Page
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  Login
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store';
import { login, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import { LoginRequest } from '@rtf-tool/shared';

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
  rememberMe: z.boolean().default(false)
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    // Clear any previous errors
    dispatch(clearError());

    try {
      const loginData: LoginRequest = {
        username: data.username,
        password: data.password
      };

      const result = await dispatch(login(loginData));

      if (login.fulfilled.match(result)) {
        // Login successful - navigation will be handled by App component
        navigate('/dashboard');
      }
      // Error handling is done in the auth slice and displayed via authError
    } catch (error) {
      // Additional error handling if needed
      console.error('Login error:', error);
    }
  };

  const handleInputChange = () => {
    // Clear errors when user starts typing
    if (authError) {
      dispatch(clearError());
    }
    clearErrors();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          mb: 3,
          fontWeight: 500,
          color: 'text.primary'
        }}
      >
        Anmeldung
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', mb: 4 }}
      >
        Melden Sie sich mit Ihren Zugangsdaten an, um RTF-Meldungen zu erstellen.
      </Typography>

      {/* Error Alert */}
      {authError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {authError}
        </Alert>
      )}

      {/* Login Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(handleLogin)}
        sx={{ width: '100%' }}
      >
        {/* Username Field */}
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Benutzername oder E-Mail"
              variant="outlined"
              margin="normal"
              disabled={isLoading}
              error={!!errors.username}
              helperText={errors.username?.message}
              onChange={(e) => {
                field.onChange(e);
                handleInputChange();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
              onChange={(e) => {
                field.onChange(e);
                handleInputChange();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Remember Me Checkbox */}
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label="Angemeldet bleiben"
              sx={{ mb: 3 }}
            />
          )}
        />

        {/* Login Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || !isValid}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Login />
            )
          }
          sx={{
            mt: 2,
            mb: 2,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
        </Button>
      </Box>

      {/* Help Text */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Bei Problemen mit der Anmeldung wenden Sie sich an Ihren Systemadministrator
          oder die IT-Abteilung.
        </Typography>
      </Box>

      {/* Demo Credentials (Development Only) */}
      {import.meta.env.DEV && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'warning.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            Demo-Zugangsdaten (nur Entwicklung):
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Benutzername: demo@bank.de
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Passwort: demo123456
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LoginPage;