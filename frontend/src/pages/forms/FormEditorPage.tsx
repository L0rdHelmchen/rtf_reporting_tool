// RTF Reporting Tool - Form Editor Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Visibility,
  Send,
  History,
  Download,
  Upload
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormDefinition } from '@rtf-tool/shared';
import FormRenderer from '../../components/forms/FormRenderer';
import { formsApi, FormInstanceData, ValidationResult } from '../../services/formsApi';

const FormEditorPage: React.FC = () => {
  const { formId, reportingPeriod } = useParams<{ formId: string; reportingPeriod: string }>();
  const navigate = useNavigate();

  // State management
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formInstance, setFormInstance] = useState<FormInstanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Dialog state
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      if (!formId || !reportingPeriod) return;

      try {
        setLoading(true);
        setError(null);

        // Load form definition and instance in parallel
        const [definition, instance] = await Promise.all([
          formsApi.getFormDefinition(formId),
          formsApi.getFormInstance(formId, reportingPeriod)
        ]);

        setFormDefinition(definition);
        setFormInstance(instance);

        // If no instance exists, create a new one
        if (!instance) {
          const newInstance = await formsApi.createFormInstance(formId, reportingPeriod);
          setFormInstance(newInstance);
        }
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden des Formulars');
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId, reportingPeriod]);

  // Handle form save
  const handleSave = async (data: any, isDraft: boolean = true) => {
    if (!formId || !reportingPeriod) return;

    try {
      setSaving(true);
      setError(null);

      const updatedInstance = await formsApi.updateFormInstance(
        formId,
        reportingPeriod,
        data,
        isDraft
      );

      setFormInstance(updatedInstance);

      // Show success message
      // TODO: Add toast notification
      console.log('Form saved successfully');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Formulars');
      console.error('Error saving form:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle form validation
  const handleValidation = async (data: any): Promise<ValidationResult> => {
    if (!formId || !reportingPeriod) {
      return { valid: false, errors: [{ field: 'form', message: 'Formular-ID oder Berichtszeitraum fehlt', severity: 'error' }] };
    }

    try {
      setValidating(true);
      const result = await formsApi.validateFormInstance(formId, reportingPeriod, data);
      setValidationResult(result);
      setShowValidation(true);
      return result;
    } catch (err: any) {
      const errorResult = {
        valid: false,
        errors: [{ field: 'validation', message: err.message || 'Validierung fehlgeschlagen', severity: 'error' as const }]
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setValidating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formId || !reportingPeriod) return;

    try {
      const submittedInstance = await formsApi.submitFormInstance(formId, reportingPeriod);
      setFormInstance(submittedInstance);
      setSubmitConfirmOpen(false);

      // Navigate back to forms list or show success page
      navigate('/forms');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Einreichen des Formulars');
      setSubmitConfirmOpen(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'excel' | 'xbrl') => {
    if (!formId || !reportingPeriod) return;

    try {
      const blob = await formsApi.exportForm(formId, reportingPeriod, format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formId}_${reportingPeriod}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Exportieren');
    }
  };

  // Get status color and label
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'in_review': return 'warning';
      case 'submitted': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'in_review': return 'In Prüfung';
      case 'submitted': return 'Eingereicht';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !formDefinition) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/forms')}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  if (!formDefinition) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Formular nicht gefunden
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/forms')}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  const isReadonly = formInstance?.status === 'submitted' || formInstance?.status === 'completed';

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/forms" underline="hover">
          RTF Formulare
        </Link>
        <Typography color="text.primary">
          {formDefinition.code} - {reportingPeriod}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {formDefinition.code} - {formDefinition.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Berichtszeitraum: {reportingPeriod}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {formInstance && (
                <Chip
                  label={getStatusLabel(formInstance.status)}
                  color={getStatusColor(formInstance.status) as any}
                />
              )}
              <Chip label={`Version ${formDefinition.version}`} variant="outlined" />
              {isReadonly && (
                <Chip label="Schreibgeschützt" color="warning" variant="outlined" />
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/forms')}
            >
              Zurück
            </Button>

            {/* Export menu could go here */}
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExport('pdf')}
            >
              Export
            </Button>

            {!isReadonly && formInstance?.status === 'in_review' && (
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => setSubmitConfirmOpen(true)}
              >
                Einreichen
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Validation Results */}
      {showValidation && validationResult && (
        <Alert
          severity={validationResult.valid ? 'success' : 'error'}
          sx={{ mb: 3 }}
          onClose={() => setShowValidation(false)}
        >
          {validationResult.valid ? (
            <Typography>✅ Das Formular ist gültig und kann eingereicht werden.</Typography>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Validierungsfehler gefunden:
              </Typography>
              <ul>
                {validationResult.errors?.map((error, index) => (
                  <li key={index}>
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Alert>
      )}

      {/* Form Renderer */}
      {formDefinition && (
        <FormRenderer
          formDefinition={formDefinition}
          initialData={formInstance?.data || {}}
          onSave={handleSave}
          onValidate={handleValidation}
          readonly={isReadonly}
          showValidation={true}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Formular einreichen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie das Formular {formDefinition.code} für den
            Berichtszeitraum {reportingPeriod} zur finalen Prüfung einreichen möchten?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Nach der Einreichung können keine Änderungen mehr vorgenommen werden.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitConfirmOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Jetzt einreichen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormEditorPage;