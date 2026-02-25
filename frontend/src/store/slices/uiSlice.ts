// RTF Reporting Tool - UI Redux Slice
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// UI state interface
interface UIState {
  // Layout state
  sidebarOpen: boolean;
  sidebarWidth: number;
  fullscreen: boolean;

  // Navigation
  currentPage: string;
  breadcrumbs: Array<{ label: string; path: string }>;

  // Modals and dialogs
  modals: Record<string, boolean>;
  dialogs: Record<string, { open: boolean; data?: any }>;

  // Notifications/Snackbars
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    autoHideDuration?: number;
    action?: { label: string; handler: () => void };
  }>;

  // Loading states for specific operations
  loadingStates: Record<string, boolean>;

  // Form UI state
  formTabs: Record<string, number>; // Track active tab per form
  expandedSections: Record<string, boolean>; // Track expanded/collapsed sections
  fieldFocus: string | null; // Currently focused field

  // Table/Grid state
  tableStates: Record<string, {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }>;

  // Theme and preferences
  theme: 'light' | 'dark';
  language: 'de' | 'en';
  dateFormat: 'DD.MM.YYYY' | 'YYYY-MM-DD';
  numberFormat: 'de-DE' | 'en-US';

  // User preferences
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number;
    showHelpText: boolean;
    compactMode: boolean;
    soundEnabled: boolean;
    confirmationsEnabled: boolean;
  };

  // Responsive design state
  isMobile: boolean;
  isTablet: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Error handling
  lastError: string | null;
  errorStack: string[];
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  fullscreen: false,
  currentPage: '/',
  breadcrumbs: [],
  modals: {},
  dialogs: {},
  notifications: [],
  loadingStates: {},
  formTabs: {},
  expandedSections: {},
  fieldFocus: null,
  tableStates: {},
  theme: 'light',
  language: 'de',
  dateFormat: 'DD.MM.YYYY',
  numberFormat: 'de-DE',
  preferences: {
    autoSave: true,
    autoSaveInterval: 30000,
    showHelpText: true,
    compactMode: false,
    soundEnabled: false,
    confirmationsEnabled: true
  },
  isMobile: false,
  isTablet: false,
  screenSize: 'md',
  lastError: null,
  errorStack: []
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Layout actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = action.payload;
    },
    toggleFullscreen: (state) => {
      state.fullscreen = !state.fullscreen;
    },

    // Navigation actions
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path: string }>>) => {
      state.breadcrumbs = action.payload;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },

    // Dialog actions
    openDialog: (state, action: PayloadAction<{ id: string; data?: any }>) => {
      state.dialogs[action.payload.id] = { open: true, data: action.payload.data };
    },
    closeDialog: (state, action: PayloadAction<string>) => {
      if (state.dialogs[action.payload]) {
        state.dialogs[action.payload].open = false;
      }
    },

    // Notification actions
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      autoHideDuration?: number;
      action?: { label: string; handler: () => void };
    }>) => {
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...action.payload
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Loading state actions
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },

    // Form UI actions
    setFormTab: (state, action: PayloadAction<{ formId: string; tabIndex: number }>) => {
      state.formTabs[action.payload.formId] = action.payload.tabIndex;
    },
    toggleSection: (state, action: PayloadAction<string>) => {
      state.expandedSections[action.payload] = !state.expandedSections[action.payload];
    },
    setExpandedSection: (state, action: PayloadAction<{ sectionId: string; expanded: boolean }>) => {
      state.expandedSections[action.payload.sectionId] = action.payload.expanded;
    },
    setFieldFocus: (state, action: PayloadAction<string | null>) => {
      state.fieldFocus = action.payload;
    },

    // Table state actions
    setTableState: (state, action: PayloadAction<{
      tableId: string;
      state: Partial<UIState['tableStates'][string]>;
    }>) => {
      state.tableStates[action.payload.tableId] = {
        ...state.tableStates[action.payload.tableId],
        ...action.payload.state
      };
    },

    // Theme and preferences actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'de' | 'en'>) => {
      state.language = action.payload;
    },
    setDateFormat: (state, action: PayloadAction<'DD.MM.YYYY' | 'YYYY-MM-DD'>) => {
      state.dateFormat = action.payload;
    },
    setNumberFormat: (state, action: PayloadAction<'de-DE' | 'en-US'>) => {
      state.numberFormat = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Responsive design actions
    setScreenSize: (state, action: PayloadAction<{
      size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      isMobile: boolean;
      isTablet: boolean;
    }>) => {
      state.screenSize = action.payload.size;
      state.isMobile = action.payload.isMobile;
      state.isTablet = action.payload.isTablet;

      // Auto-close sidebar on mobile
      if (action.payload.isMobile) {
        state.sidebarOpen = false;
      }
    },

    // Error handling actions
    setError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;
      state.errorStack.push(action.payload);
      // Keep only last 10 errors
      if (state.errorStack.length > 10) {
        state.errorStack = state.errorStack.slice(-10);
      }
    },
    clearError: (state) => {
      state.lastError = null;
    },
    clearErrorStack: (state) => {
      state.errorStack = [];
    },

    // Utility actions
    resetUIState: (state) => {
      return { ...initialState, preferences: state.preferences };
    }
  }
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  toggleFullscreen,
  setCurrentPage,
  setBreadcrumbs,
  openModal,
  closeModal,
  toggleModal,
  openDialog,
  closeDialog,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setLoading,
  clearLoading,
  setFormTab,
  toggleSection,
  setExpandedSection,
  setFieldFocus,
  setTableState,
  setTheme,
  setLanguage,
  setDateFormat,
  setNumberFormat,
  updatePreferences,
  setScreenSize,
  setError,
  clearError,
  clearErrorStack,
  resetUIState
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectSidebarWidth = (state: { ui: UIState }) => state.ui.sidebarWidth;
export const selectFullscreen = (state: { ui: UIState }) => state.ui.fullscreen;
export const selectCurrentPage = (state: { ui: UIState }) => state.ui.currentPage;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectDialogs = (state: { ui: UIState }) => state.ui.dialogs;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectLoadingStates = (state: { ui: UIState }) => state.ui.loadingStates;
export const selectFormTabs = (state: { ui: UIState }) => state.ui.formTabs;
export const selectExpandedSections = (state: { ui: UIState }) => state.ui.expandedSections;
export const selectFieldFocus = (state: { ui: UIState }) => state.ui.fieldFocus;
export const selectTableStates = (state: { ui: UIState }) => state.ui.tableStates;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectDateFormat = (state: { ui: UIState }) => state.ui.dateFormat;
export const selectNumberFormat = (state: { ui: UIState }) => state.ui.numberFormat;
export const selectPreferences = (state: { ui: UIState }) => state.ui.preferences;
export const selectIsMobile = (state: { ui: UIState }) => state.ui.isMobile;
export const selectIsTablet = (state: { ui: UIState }) => state.ui.isTablet;
export const selectScreenSize = (state: { ui: UIState }) => state.ui.screenSize;
export const selectLastError = (state: { ui: UIState }) => state.ui.lastError;
export const selectErrorStack = (state: { ui: UIState }) => state.ui.errorStack;

// Helper selectors
export const selectIsModalOpen = (modalId: string) => (state: { ui: UIState }) =>
  state.ui.modals[modalId] || false;

export const selectIsDialogOpen = (dialogId: string) => (state: { ui: UIState }) =>
  state.ui.dialogs[dialogId]?.open || false;

export const selectDialogData = (dialogId: string) => (state: { ui: UIState }) =>
  state.ui.dialogs[dialogId]?.data;

export const selectIsLoading = (key: string) => (state: { ui: UIState }) =>
  state.ui.loadingStates[key] || false;

export const selectFormTab = (formId: string) => (state: { ui: UIState }) =>
  state.ui.formTabs[formId] || 0;

export const selectIsSectionExpanded = (sectionId: string) => (state: { ui: UIState }) =>
  state.ui.expandedSections[sectionId] !== false; // Default to expanded

export const selectTableState = (tableId: string) => (state: { ui: UIState }) =>
  state.ui.tableStates[tableId] || { page: 0, pageSize: 25 };

export default uiSlice.reducer;