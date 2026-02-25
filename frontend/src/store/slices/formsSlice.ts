// RTF Reporting Tool - Forms Redux Slice
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  FormDefinition,
  FormInstance,
  FormStructure,
  ValidationError,
  FormStatus,
  CreateFormInstanceRequest,
  UpdateFormInstanceRequest
} from '@rtf-tool/shared';
import { formsApi } from '../../services/api';

// Forms state interface
interface FormsState {
  // Form definitions (loaded once, cached)
  formDefinitions: FormDefinition[];
  formStructures: Record<string, FormStructure>;

  // Current form instances (user data)
  currentInstances: Record<string, FormInstance>;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isValidating: boolean;
  error: string | null;

  // Current form being edited
  activeFormId: string | null;
  activeReportingPeriod: string | null;

  // Validation
  validationErrors: Record<string, ValidationError[]>;
  hasUnsavedChanges: boolean;

  // Filters and search
  formFilter: {
    category?: string;
    status?: FormStatus;
    search?: string;
  };

  // Metadata
  lastUpdated: number;
  autoSaveInterval: number;
}

// Initial state
const initialState: FormsState = {
  formDefinitions: [],
  formStructures: {},
  currentInstances: {},
  isLoading: false,
  isSaving: false,
  isValidating: false,
  error: null,
  activeFormId: null,
  activeReportingPeriod: null,
  validationErrors: {},
  hasUnsavedChanges: false,
  formFilter: {},
  lastUpdated: 0,
  autoSaveInterval: 30000 // 30 seconds
};

// Async thunks
export const loadFormDefinitions = createAsyncThunk(
  'forms/loadFormDefinitions',
  async (_, { rejectWithValue }) => {
    try {
      const formDefinitions = await formsApi.getFormDefinitions();
      return formDefinitions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formulardefinitionen konnten nicht geladen werden'
      );
    }
  }
);

export const loadFormStructure = createAsyncThunk(
  'forms/loadFormStructure',
  async (formId: string, { rejectWithValue }) => {
    try {
      const formStructure = await formsApi.getFormStructure(formId);
      return { formId, formStructure };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formularstruktur konnte nicht geladen werden'
      );
    }
  }
);

export const createFormInstance = createAsyncThunk(
  'forms/createFormInstance',
  async (request: CreateFormInstanceRequest, { rejectWithValue }) => {
    try {
      const formInstance = await formsApi.createFormInstance(request);
      return formInstance;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formularinstanz konnte nicht erstellt werden'
      );
    }
  }
);

export const loadFormInstance = createAsyncThunk(
  'forms/loadFormInstance',
  async ({ formId, reportingPeriod }: { formId: string; reportingPeriod: string }, { rejectWithValue }) => {
    try {
      const formInstance = await formsApi.getFormInstance(formId, reportingPeriod);
      return formInstance;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formularinstanz konnte nicht geladen werden'
      );
    }
  }
);

export const updateFormInstance = createAsyncThunk(
  'forms/updateFormInstance',
  async ({ formId, reportingPeriod, data }: {
    formId: string;
    reportingPeriod: string;
    data: UpdateFormInstanceRequest;
  }, { rejectWithValue }) => {
    try {
      const formInstance = await formsApi.updateFormInstance(formId, reportingPeriod, data);
      return formInstance;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formularinstanz konnte nicht gespeichert werden'
      );
    }
  }
);

export const validateForm = createAsyncThunk(
  'forms/validateForm',
  async ({ formId, reportingPeriod, data }: {
    formId: string;
    reportingPeriod: string;
    data: any;
  }, { rejectWithValue }) => {
    try {
      const validation = await formsApi.validateForm(formId, reportingPeriod, data);
      return { formId, reportingPeriod, validation };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Validierung fehlgeschlagen'
      );
    }
  }
);

export const submitFormInstance = createAsyncThunk(
  'forms/submitFormInstance',
  async ({ formId, reportingPeriod }: { formId: string; reportingPeriod: string }, { rejectWithValue }) => {
    try {
      const formInstance = await formsApi.submitFormInstance(formId, reportingPeriod);
      return formInstance;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Formular konnte nicht eingereicht werden'
      );
    }
  }
);

// Forms slice
const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    // UI Actions
    setActiveForm: (state, action: PayloadAction<{ formId: string; reportingPeriod: string }>) => {
      state.activeFormId = action.payload.formId;
      state.activeReportingPeriod = action.payload.reportingPeriod;
    },
    clearActiveForm: (state) => {
      state.activeFormId = null;
      state.activeReportingPeriod = null;
      state.hasUnsavedChanges = false;
    },

    // Filter Actions
    setFormFilter: (state, action: PayloadAction<Partial<FormsState['formFilter']>>) => {
      state.formFilter = { ...state.formFilter, ...action.payload };
    },
    clearFormFilter: (state) => {
      state.formFilter = {};
    },

    // Form Data Actions
    updateFormData: (state, action: PayloadAction<{
      formId: string;
      reportingPeriod: string;
      fieldPath: string;
      value: any;
    }>) => {
      const { formId, reportingPeriod, fieldPath, value } = action.payload;
      const instanceKey = `${formId}_${reportingPeriod}`;

      if (state.currentInstances[instanceKey]) {
        state.currentInstances[instanceKey].formData[fieldPath] = value;
        state.hasUnsavedChanges = true;
        state.lastUpdated = Date.now();
      }
    },

    // Validation Actions
    setValidationErrors: (state, action: PayloadAction<{
      formId: string;
      reportingPeriod: string;
      errors: ValidationError[];
    }>) => {
      const { formId, reportingPeriod, errors } = action.payload;
      const instanceKey = `${formId}_${reportingPeriod}`;
      state.validationErrors[instanceKey] = errors;
    },
    clearValidationErrors: (state, action: PayloadAction<{
      formId: string;
      reportingPeriod: string;
    }>) => {
      const { formId, reportingPeriod } = action.payload;
      const instanceKey = `${formId}_${reportingPeriod}`;
      delete state.validationErrors[instanceKey];
    },

    // State Management
    markAsSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Load form definitions
    builder
      .addCase(loadFormDefinitions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFormDefinitions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.formDefinitions = action.payload;
      })
      .addCase(loadFormDefinitions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load form structure
    builder
      .addCase(loadFormStructure.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadFormStructure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.formStructures[action.payload.formId] = action.payload.formStructure;
      })
      .addCase(loadFormStructure.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create form instance
    builder
      .addCase(createFormInstance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFormInstance.fulfilled, (state, action) => {
        state.isLoading = false;
        const formInstance = action.payload;
        const instanceKey = `${formInstance.formDefinitionId}_${formInstance.reportingPeriod}`;
        state.currentInstances[instanceKey] = formInstance;
      })
      .addCase(createFormInstance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load form instance
    builder
      .addCase(loadFormInstance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadFormInstance.fulfilled, (state, action) => {
        state.isLoading = false;
        const formInstance = action.payload;
        const instanceKey = `${formInstance.formDefinitionId}_${formInstance.reportingPeriod}`;
        state.currentInstances[instanceKey] = formInstance;
      })
      .addCase(loadFormInstance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update form instance
    builder
      .addCase(updateFormInstance.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateFormInstance.fulfilled, (state, action) => {
        state.isSaving = false;
        state.hasUnsavedChanges = false;
        const formInstance = action.payload;
        const instanceKey = `${formInstance.formDefinitionId}_${formInstance.reportingPeriod}`;
        state.currentInstances[instanceKey] = formInstance;
      })
      .addCase(updateFormInstance.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Validate form
    builder
      .addCase(validateForm.pending, (state) => {
        state.isValidating = true;
      })
      .addCase(validateForm.fulfilled, (state, action) => {
        state.isValidating = false;
        const { formId, reportingPeriod, validation } = action.payload;
        const instanceKey = `${formId}_${reportingPeriod}`;
        state.validationErrors[instanceKey] = validation.errors;
      })
      .addCase(validateForm.rejected, (state, action) => {
        state.isValidating = false;
        state.error = action.payload as string;
      });

    // Submit form instance
    builder
      .addCase(submitFormInstance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitFormInstance.fulfilled, (state, action) => {
        state.isLoading = false;
        const formInstance = action.payload;
        const instanceKey = `${formInstance.formDefinitionId}_${formInstance.reportingPeriod}`;
        state.currentInstances[instanceKey] = formInstance;
        state.hasUnsavedChanges = false;
      })
      .addCase(submitFormInstance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const {
  setActiveForm,
  clearActiveForm,
  setFormFilter,
  clearFormFilter,
  updateFormData,
  setValidationErrors,
  clearValidationErrors,
  markAsSaved,
  clearError
} = formsSlice.actions;

// Selectors
export const selectForms = (state: { forms: FormsState }) => state.forms;
export const selectFormDefinitions = (state: { forms: FormsState }) => state.forms.formDefinitions;
export const selectFormStructures = (state: { forms: FormsState }) => state.forms.formStructures;
export const selectCurrentInstances = (state: { forms: FormsState }) => state.forms.currentInstances;
export const selectFormsLoading = (state: { forms: FormsState }) => state.forms.isLoading;
export const selectFormsSaving = (state: { forms: FormsState }) => state.forms.isSaving;
export const selectFormsValidating = (state: { forms: FormsState }) => state.forms.isValidating;
export const selectFormsError = (state: { forms: FormsState }) => state.forms.error;
export const selectActiveForm = (state: { forms: FormsState }) => ({
  formId: state.forms.activeFormId,
  reportingPeriod: state.forms.activeReportingPeriod
});
export const selectHasUnsavedChanges = (state: { forms: FormsState }) => state.forms.hasUnsavedChanges;
export const selectFormFilter = (state: { forms: FormsState }) => state.forms.formFilter;

// Helper selectors
export const selectFormDefinitionById = (formId: string) => (state: { forms: FormsState }) =>
  state.forms.formDefinitions.find(form => form.id === formId);

export const selectFormStructureById = (formId: string) => (state: { forms: FormsState }) =>
  state.forms.formStructures[formId];

export const selectFormInstance = (formId: string, reportingPeriod: string) => (state: { forms: FormsState }) => {
  const instanceKey = `${formId}_${reportingPeriod}`;
  return state.forms.currentInstances[instanceKey];
};

export const selectValidationErrors = (formId: string, reportingPeriod: string) => (state: { forms: FormsState }) => {
  const instanceKey = `${formId}_${reportingPeriod}`;
  return state.forms.validationErrors[instanceKey] || [];
};

export const selectFormsByCategory = (category: string) => (state: { forms: FormsState }) =>
  state.forms.formDefinitions.filter(form => form.category === category);

export const selectFilteredForms = (state: { forms: FormsState }) => {
  let filtered = state.forms.formDefinitions;

  if (state.forms.formFilter.category) {
    filtered = filtered.filter(form => form.category === state.forms.formFilter.category);
  }

  if (state.forms.formFilter.search) {
    const search = state.forms.formFilter.search.toLowerCase();
    filtered = filtered.filter(form =>
      form.nameDe.toLowerCase().includes(search) ||
      form.code.toLowerCase().includes(search)
    );
  }

  return filtered;
};

export default formsSlice.reducer;