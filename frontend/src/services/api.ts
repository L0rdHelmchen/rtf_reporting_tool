// RTF Reporting Tool - API Services
import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  FormDefinition,
  FormInstance,
  FormStructure,
  CreateFormInstanceRequest,
  UpdateFormInstanceRequest,
  ValidateFormRequest,
  ValidateFormResponse,
  GenerateXBRLRequest,
  GenerateXBRLResponse,
  Institution,
  User
} from '@rtf-tool/shared';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rtf_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('rtf_refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;

          localStorage.setItem('rtf_access_token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('rtf_access_token');
        localStorage.removeItem('rtf_refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);

    // Store tokens
    localStorage.setItem('rtf_access_token', response.data.accessToken);
    localStorage.setItem('rtf_refresh_token', response.data.refreshToken);

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('rtf_access_token');
      localStorage.removeItem('rtf_refresh_token');
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User; institution: Institution }> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Forms API
export const formsApi = {
  getFormDefinitions: async (): Promise<FormDefinition[]> => {
    const response = await api.get<FormDefinition[]>('/forms');
    return response.data;
  },

  getFormDefinition: async (formId: string): Promise<FormDefinition> => {
    const response = await api.get<FormDefinition>(`/forms/${formId}`);
    return response.data;
  },

  getFormStructure: async (formId: string): Promise<FormStructure> => {
    const response = await api.get<FormStructure>(`/forms/${formId}/structure`);
    return response.data;
  },

  getFormInstance: async (formId: string, reportingPeriod: string): Promise<FormInstance> => {
    const response = await api.get<FormInstance>(`/forms/${formId}/instances`, {
      params: { reportingPeriod }
    });
    return response.data;
  },

  createFormInstance: async (request: CreateFormInstanceRequest): Promise<FormInstance> => {
    const response = await api.post<FormInstance>('/forms/instances', request);
    return response.data;
  },

  updateFormInstance: async (
    formId: string,
    reportingPeriod: string,
    data: UpdateFormInstanceRequest
  ): Promise<FormInstance> => {
    const response = await api.put<FormInstance>(`/forms/${formId}/instances`, data, {
      params: { reportingPeriod }
    });
    return response.data;
  },

  validateForm: async (
    formId: string,
    reportingPeriod: string,
    data: ValidateFormRequest
  ): Promise<ValidateFormResponse> => {
    const response = await api.post<ValidateFormResponse>(`/forms/${formId}/validate`, data, {
      params: { reportingPeriod }
    });
    return response.data;
  },

  submitFormInstance: async (formId: string, reportingPeriod: string): Promise<FormInstance> => {
    const response = await api.post<FormInstance>(`/forms/${formId}/submit`, {}, {
      params: { reportingPeriod }
    });
    return response.data;
  }
};

// XBRL API
export const xbrlApi = {
  generateXBRL: async (request: GenerateXBRLRequest): Promise<GenerateXBRLResponse> => {
    const response = await api.post<GenerateXBRLResponse>('/xbrl/generate', request);
    return response.data;
  },

  validateXBRL: async (file: File): Promise<ValidateFormResponse> => {
    const formData = new FormData();
    formData.append('xbrlFile', file);

    const response = await api.post<ValidateFormResponse>('/xbrl/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  downloadXBRL: async (formInstanceIds: string[], reportingPeriod: string): Promise<Blob> => {
    const response = await api.post('/xbrl/download', {
      formInstanceIds,
      reportingPeriod
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Institutions API
export const institutionsApi = {
  getInstitution: async (institutionId: string): Promise<Institution> => {
    const response = await api.get<Institution>(`/institutions/${institutionId}`);
    return response.data;
  },

  updateInstitution: async (institutionId: string, data: Partial<Institution>): Promise<Institution> => {
    const response = await api.put<Institution>(`/institutions/${institutionId}`, data);
    return response.data;
  }
};

// Users API
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  }
};

// Health API
export const healthApi = {
  ping: async (): Promise<{ message: string; timestamp: string }> => {
    const response = await api.get('/health/ping');
    return response.data;
  },

  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health/check');
    return response.data;
  }
};

// Error handling utilities
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    if (errorData.error?.message) {
      return errorData.error.message;
    }
    if (typeof errorData === 'string') {
      return errorData;
    }
  }

  if (error.message) {
    return error.message;
  }

  return 'Ein unbekannter Fehler ist aufgetreten';
};

// Request retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
};

// File download utility
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;