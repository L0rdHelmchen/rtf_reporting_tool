// RTF Reporting Tool - Dynamic Form Renderer
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { ExpandMore, Save, Visibility, Send } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextFieldSI6,
  MoneyFieldMI1,
  PercentageFieldPI2,
  IntegerFieldII3,
  DateFieldDI5,
  BooleanFieldBI7,
  EnumFieldEI,
  DimensionalSelector,
  TextAreaField
} from './FormFieldComponents';

// Types for form field definitions
interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  dataType: 'si6' | 'mi1' | 'pi2' | 'ii3' | 'di5' | 'bi7' | 'ei8' | 'text';
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
  enumOptions?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  dimensions?: Array<{
    id: string;
    label: string;
    parentId?: string;
    level: number;
  }>;
  helpText?: string;
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

interface FormSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
  repeatable?: boolean;
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

interface FormDefinition {
  id: string;
  code: string;
  name: string;
  version: string;
  sections: FormSectionDefinition[];
  validationRules?: Array<{
    id: string;
    rule: string;
    message: string;
  }>;
}

interface FormRendererProps {
  formDefinition: FormDefinition;
  initialData?: any;
  onSave: (data: any, isDraft: boolean) => Promise<void>;
  onValidate?: (data: any) => Promise<{ valid: boolean; errors?: any[] }>;
  readonly?: boolean;
  showValidation?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formDefinition,
  initialData = {},
  onSave,
  onValidate,
  readonly = false,
  showValidation = false
}) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Generate dynamic validation schema based on form definition
  const generateValidationSchema = (formDef: FormDefinition) => {
    const schemaFields: any = {};

    formDef.sections.forEach(section => {
      section.fields.forEach(field => {
        let fieldSchema: any;

        switch (field.dataType) {
          case 'si6':
          case 'text': {
            const isEmail = field.label.toLowerCase().includes('mail') || field.name.toLowerCase().includes('mail');
            fieldSchema = isEmail
              ? z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
              : z.string();
            if (field.validation?.maxLength) {
              fieldSchema = fieldSchema.max(field.validation.maxLength);
            }
            break;
          }
          case 'mi1':
            fieldSchema = z.coerce.number();
            if (field.validation?.min !== undefined) {
              fieldSchema = fieldSchema.min(field.validation.min);
            }
            if (field.validation?.max !== undefined) {
              fieldSchema = fieldSchema.max(field.validation.max);
            }
            break;
          case 'pi2':
            fieldSchema = z.coerce.number().min(0).max(100);
            break;
          case 'ii3':
            fieldSchema = z.coerce.number().int();
            if (field.validation?.min !== undefined) {
              fieldSchema = fieldSchema.min(field.validation.min);
            }
            if (field.validation?.max !== undefined) {
              fieldSchema = fieldSchema.max(field.validation.max);
            }
            break;
          case 'di5':
            fieldSchema = z.string();
            break;
          case 'bi7':
            fieldSchema = z.boolean();
            break;
          case 'ei8':
            fieldSchema = z.string();
            break;
          default:
            fieldSchema = z.string();
        }

        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }

        schemaFields[field.name] = fieldSchema;
      });
    });

    return z.object(schemaFields);
  };

  const methods = useForm({
    resolver: zodResolver(generateValidationSchema(formDefinition)),
    defaultValues: initialData,
    mode: 'onChange'
  });

  const { handleSubmit, watch, formState: { isDirty, isValid } } = methods;

  // Watch all form values for conditional field logic
  const watchedValues = watch();

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field: FormFieldDefinition): boolean => {
    if (!field.conditional) return true;

    const dependentValue = watchedValues[field.conditional.dependsOn];
    return dependentValue === field.conditional.showWhen;
  };

  // Check if section should be shown based on conditional logic
  const shouldShowSection = (section: FormSectionDefinition): boolean => {
    if (!section.conditional) return true;

    const dependentValue = watchedValues[section.conditional.dependsOn];
    return dependentValue === section.conditional.showWhen;
  };

  // Render individual form field based on data type
  const renderField = (field: FormFieldDefinition) => {
    if (!shouldShowField(field)) return null;

    const baseProps = {
      name: field.name,
      label: field.label,
      control: methods.control,
      required: field.required,
      disabled: readonly,
      helperText: field.helpText
    };

    switch (field.dataType) {
      case 'si6': {
        const isEmail = field.label.toLowerCase().includes('mail') || field.name.toLowerCase().includes('mail');
        return (
          <TextFieldSI6
            {...baseProps}
            maxLength={isEmail ? 254 : (field.validation?.maxLength || 6)}
            inputType={isEmail ? 'email' : 'text'}
          />
        );
      }
      case 'mi1':
        return (
          <MoneyFieldMI1
            {...baseProps}
            allowNegative={field.validation?.min === undefined || field.validation.min < 0}
          />
        );
      case 'pi2':
        return (
          <PercentageFieldPI2
            {...baseProps}
            min={field.validation?.min || 0}
            max={field.validation?.max || 100}
          />
        );
      case 'ii3':
        return (
          <IntegerFieldII3
            {...baseProps}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
      case 'di5':
        return <DateFieldDI5 {...baseProps} />;
      case 'bi7':
        return <BooleanFieldBI7 {...baseProps} />;
      case 'ei8':
        return (
          <EnumFieldEI
            {...baseProps}
            options={field.enumOptions || []}
          />
        );
      case 'text':
        return (
          <TextAreaField
            {...baseProps}
            maxLength={field.validation?.maxLength || 2000}
          />
        );
      default:
        return <TextFieldSI6 {...baseProps} />;
    }
  };

  // Handle form submission
  const onSubmit = async (data: any, isDraft: boolean = false) => {
    setLoading(true);
    try {
      // Validate if not draft
      if (!isDraft && onValidate) {
        const validation = await onValidate(data);
        if (!validation.valid) {
          setValidationErrors(validation.errors || []);
          setLoading(false);
          return;
        }
      }

      await onSave(data, isDraft);
      setValidationErrors([]);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle section expansion
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Initialize expanded sections
  useEffect(() => {
    const visibleSections = formDefinition.sections
      .filter(shouldShowSection)
      .map(s => s.id);
    setExpandedSections(visibleSections.slice(0, 2)); // Expand first 2 sections by default
  }, [formDefinition]);

  if (!formDefinition) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        {/* Form Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" gutterBottom>
                {formDefinition.code} - {formDefinition.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: {formDefinition.version}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={readonly ? 'Nur Ansicht' : 'Bearbeitung'}
                color={readonly ? 'default' : 'primary'}
                variant="outlined"
              />
              {isDirty && !readonly && (
                <Chip
                  label="Ungespeicherte Änderungen"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Validierungsfehler gefunden:
            </Typography>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Form Sections */}
        {formDefinition.sections
          .filter(shouldShowSection)
          .map((section, index) => (
            <Accordion
              key={section.id}
              expanded={expandedSections.includes(section.id)}
              onChange={() => handleSectionToggle(section.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">
                    {section.title}
                  </Typography>
                  <Chip
                    label={`${section.fields.filter(shouldShowField).length} Felder`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {section.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {section.description}
                  </Typography>
                )}

                <Grid container spacing={3}>
                  {section.fields
                    .filter(shouldShowField)
                    .map((field) => (
                      <Grid
                        item
                        xs={12}
                        sm={field.dataType === 'text' ? 12 : 6}
                        md={field.dataType === 'text' ? 12 : 4}
                        key={field.id}
                      >
                        {renderField(field)}
                      </Grid>
                    ))}
                </Grid>

                {index < formDefinition.sections.length - 1 && (
                  <Divider sx={{ mt: 3 }} />
                )}
              </AccordionDetails>
            </Accordion>
          ))}

        {/* Form Actions */}
        {!readonly && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                disabled={loading}
              >
                Als Entwurf speichern
              </Button>

              {showValidation && (
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => onValidate?.(watchedValues)}
                  disabled={loading}
                >
                  Validieren
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={loading || !isValid}
              >
                {loading ? <CircularProgress size={20} /> : 'Zur Prüfung einreichen'}
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </FormProvider>
  );
};

export default FormRenderer;