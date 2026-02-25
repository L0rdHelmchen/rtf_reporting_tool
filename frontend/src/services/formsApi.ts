// RTF Reporting Tool - Forms API Service
import { api } from './api';
import { FormDefinition, FormInstance, FormStatus } from '@rtf-tool/shared';

export interface FormListItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: FormStatus;
  lastModified: string;
  reportingPeriod?: string;
  version: string;
}

export interface FormInstanceData {
  instanceId: string;
  formDefinitionId: string;
  data: any;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  validatedAt?: string;
  reportingPeriod: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

export interface FormSearchParams {
  search?: string;
  category?: string;
  status?: FormStatus;
  reportingPeriod?: string;
  page?: number;
  limit?: number;
}

class FormsApiService {
  // Get list of available form definitions
  async getFormDefinitions(params?: FormSearchParams): Promise<{
    forms: FormListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.reportingPeriod) searchParams.append('reportingPeriod', params.reportingPeriod);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get(`/forms?${searchParams.toString()}`);
    return response.data;
  }

  // Get specific form definition
  async getFormDefinition(formId: string): Promise<FormDefinition> {
    const response = await api.get(`/forms/${formId}/definition`);
    return response.data;
  }

  // Get form instance (user's saved data)
  async getFormInstance(formId: string, reportingPeriod: string): Promise<FormInstanceData | null> {
    try {
      const response = await api.get(`/forms/${formId}/instance?reportingPeriod=${reportingPeriod}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No instance exists yet
      }
      throw error;
    }
  }

  // Create new form instance
  async createFormInstance(
    formId: string,
    reportingPeriod: string,
    data: any = {}
  ): Promise<FormInstanceData> {
    const response = await api.post(`/forms/${formId}/instance`, {
      reportingPeriod,
      data
    });
    return response.data;
  }

  // Update form instance
  async updateFormInstance(
    formId: string,
    reportingPeriod: string,
    data: any,
    isDraft: boolean = true
  ): Promise<FormInstanceData> {
    const response = await api.put(`/forms/${formId}/instance`, {
      reportingPeriod,
      data,
      status: isDraft ? 'draft' : 'in_review'
    });
    return response.data;
  }

  // Validate form data
  async validateFormInstance(
    formId: string,
    reportingPeriod: string,
    data: any
  ): Promise<ValidationResult> {
    const response = await api.post(`/forms/${formId}/validate`, {
      reportingPeriod,
      data
    });
    return response.data;
  }

  // Submit form for review
  async submitFormInstance(
    formId: string,
    reportingPeriod: string
  ): Promise<FormInstanceData> {
    const response = await api.post(`/forms/${formId}/submit`, {
      reportingPeriod
    });
    return response.data;
  }

  // Get form categories
  async getFormCategories(): Promise<Array<{
    code: string;
    name: string;
    count: number;
  }>> {
    const response = await api.get('/forms/categories');
    return response.data;
  }

  // Get reporting periods
  async getReportingPeriods(): Promise<Array<{
    id: string;
    label: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>> {
    const response = await api.get('/reporting-periods');
    return response.data;
  }

  // Get form statistics for dashboard
  async getFormStatistics(): Promise<{
    total: number;
    byStatus: Record<FormStatus, number>;
    byCategory: Record<string, number>;
    recentActivity: Array<{
      formCode: string;
      action: string;
      timestamp: string;
    }>;
  }> {
    const response = await api.get('/forms/statistics');
    return response.data;
  }

  // Clone form instance to new reporting period
  async cloneFormInstance(
    formId: string,
    fromPeriod: string,
    toPeriod: string
  ): Promise<FormInstanceData> {
    const response = await api.post(`/forms/${formId}/clone`, {
      fromPeriod,
      toPeriod
    });
    return response.data;
  }

  // Get form history/audit trail
  async getFormHistory(
    formId: string,
    reportingPeriod: string
  ): Promise<Array<{
    id: string;
    action: string;
    timestamp: string;
    userId: string;
    userName: string;
    changes?: any;
  }>> {
    const response = await api.get(`/forms/${formId}/history?reportingPeriod=${reportingPeriod}`);
    return response.data;
  }

  // Export form as different formats
  async exportForm(
    formId: string,
    reportingPeriod: string,
    format: 'pdf' | 'excel' | 'xbrl'
  ): Promise<Blob> {
    const response = await api.get(
      `/forms/${formId}/export?reportingPeriod=${reportingPeriod}&format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Import form data
  async importFormData(
    formId: string,
    reportingPeriod: string,
    file: File,
    format: 'excel' | 'csv'
  ): Promise<{
    success: boolean;
    imported: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportingPeriod', reportingPeriod);
    formData.append('format', format);

    const response = await api.post(`/forms/${formId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Get form templates/samples
  async getFormTemplate(formId: string): Promise<any> {
    const response = await api.get(`/forms/${formId}/template`);
    return response.data;
  }

  // Search within form data
  async searchFormData(query: string, filters?: {
    formIds?: string[];
    reportingPeriods?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  }): Promise<Array<{
    formId: string;
    formCode: string;
    reportingPeriod: string;
    matches: Array<{
      field: string;
      value: any;
      context: string;
    }>;
  }>> {
    const response = await api.post('/forms/search', {
      query,
      filters
    });
    return response.data;
  }
}

export const formsApi = new FormsApiService();