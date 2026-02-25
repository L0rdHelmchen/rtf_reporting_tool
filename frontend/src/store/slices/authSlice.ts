// RTF Reporting Tool - Authentication Redux Slice
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { User, Institution, LoginRequest, LoginResponse } from '@rtf-tool/shared';
import { authApi } from '../../services/api';

// Auth state interface
interface AuthState {
  user: User | null;
  institution: Institution | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  lastActivity: number;
}

// Initial state
const initialState: AuthState = {
  user: null,
  institution: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
  lastActivity: Date.now()
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Login fehlgeschlagen'
      );
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken(refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Token-Aktualisierung fehlgeschlagen'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.accessToken) {
        await authApi.logout();
      }
      return null;
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      return null;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Benutzerinformationen konnten nicht geladen werden'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.institution = action.payload.institution;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.institution = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Refresh token cases
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // If refresh fails, user needs to login again
        state.isAuthenticated = false;
        state.user = null;
        state.institution = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
      });

    // Logout cases
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.institution = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.isLoading = false;
      });

    // Get current user cases
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.institution = action.payload.institution;
        state.lastActivity = Date.now();
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Don't clear auth state on user fetch failure
        // The user might still be authenticated
      });
  }
});

// Export actions
export const { clearError, updateLastActivity, setTokens, clearTokens } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectInstitution = (state: { auth: AuthState }) => state.auth.institution;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;

// Helper selectors
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectInstitutionId = (state: { auth: AuthState }) => state.auth.user?.institutionId;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role === 'admin';
export const selectCanEdit = (state: { auth: AuthState }) =>
  ['admin', 'compliance_officer', 'risk_manager', 'data_entry'].includes(state.auth.user?.role || '');
export const selectCanReview = (state: { auth: AuthState }) =>
  ['admin', 'compliance_officer', 'reviewer'].includes(state.auth.user?.role || '');

// Session timeout helpers
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;
export const selectIsSessionExpired = (state: { auth: AuthState }) => {
  const now = Date.now();
  const lastActivity = state.auth.lastActivity;
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  return now - lastActivity > sessionTimeout;
};

export default authSlice.reducer;