// RTF Reporting Tool - Specialized Form Field Components
import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Box,
  InputAdornment,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTime } from 'luxon';
import { Controller, Control } from 'react-hook-form';

// Base field props
interface BaseFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
}

// SI6 - Text field (6 characters max)
export const TextFieldSI6: React.FC<BaseFieldProps & { maxLength?: number }> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  maxLength = 6
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? 'Dieses Feld ist erforderlich' : false }}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        label={label}
        error={error || !!fieldState.error}
        helperText={fieldState.error?.message || helperText}
        disabled={disabled}
        inputProps={{ maxLength }}
        sx={{ mb: 2 }}
      />
    )}
  />
);

// MI1 - Monetary field (Euro)
export const MoneyFieldMI1: React.FC<BaseFieldProps & { allowNegative?: boolean }> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  allowNegative = true
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required ? 'Dieses Feld ist erforderlich' : false,
      pattern: {
        value: allowNegative ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/,
        message: 'Bitte geben Sie einen gültigen Betrag ein'
      }
    }}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        type="number"
        label={label}
        error={error || !!fieldState.error}
        helperText={fieldState.error?.message || helperText}
        disabled={disabled}
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
        inputProps={{
          step: 0.01,
          min: allowNegative ? undefined : 0
        }}
        sx={{ mb: 2 }}
      />
    )}
  />
);

// PI2 - Percentage field
export const PercentageFieldPI2: React.FC<BaseFieldProps & { min?: number; max?: number }> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  min = 0,
  max = 100
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required ? 'Dieses Feld ist erforderlich' : false,
      min: { value: min, message: `Minimum: ${min}%` },
      max: { value: max, message: `Maximum: ${max}%` }
    }}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        type="number"
        label={label}
        error={error || !!fieldState.error}
        helperText={fieldState.error?.message || helperText}
        disabled={disabled}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
        inputProps={{
          step: 0.01,
          min,
          max
        }}
        sx={{ mb: 2 }}
      />
    )}
  />
);

// II3 - Integer field
export const IntegerFieldII3: React.FC<BaseFieldProps & { min?: number; max?: number }> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  min,
  max
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required ? 'Dieses Feld ist erforderlich' : false,
      pattern: {
        value: /^-?\d+$/,
        message: 'Bitte geben Sie eine ganze Zahl ein'
      },
      min: min !== undefined ? { value: min, message: `Minimum: ${min}` } : undefined,
      max: max !== undefined ? { value: max, message: `Maximum: ${max}` } : undefined
    }}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        type="number"
        label={label}
        error={error || !!fieldState.error}
        helperText={fieldState.error?.message || helperText}
        disabled={disabled}
        inputProps={{
          step: 1,
          min,
          max
        }}
        sx={{ mb: 2 }}
      />
    )}
  />
);

// DI5 - Date field
export const DateFieldDI5: React.FC<BaseFieldProps> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? 'Dieses Feld ist erforderlich' : false }}
    render={({ field, fieldState }) => (
      <DatePicker
        label={label}
        disabled={disabled}
        value={field.value ? DateTime.fromISO(field.value) : null}
        onChange={(val) => field.onChange(val ? (val as DateTime).toISODate() : null)}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error || !!fieldState.error,
            helperText: fieldState.error?.message || helperText,
            sx: { mb: 2 }
          }
        }}
      />
    )}
  />
);

// BI7 - Boolean field (Checkbox)
export const BooleanFieldBI7: React.FC<BaseFieldProps & { description?: string }> = ({
  name,
  label,
  control,
  disabled = false,
  description
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={field.value || false}
              disabled={disabled}
            />
          }
          label={label}
        />
        {description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {description}
          </Typography>
        )}
      </Box>
    )}
  />
);

// Enumeration fields (EI8-EI62) - Select dropdown
interface EnumOption {
  value: string;
  label: string;
  description?: string;
}

export const EnumFieldEI: React.FC<BaseFieldProps & {
  options: EnumOption[];
  multiple?: boolean;
}> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  options,
  multiple = false
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? 'Dieses Feld ist erforderlich' : false }}
    render={({ field, fieldState }) => (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel error={error || !!fieldState.error}>{label}</InputLabel>
        <Select
          {...field}
          label={label}
          error={error || !!fieldState.error}
          disabled={disabled}
          multiple={multiple}
          renderValue={multiple ? (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => {
                const option = options.find(o => o.value === value);
                return (
                  <Chip key={value} label={option?.label || value} size="small" />
                );
              })}
            </Box>
          ) : undefined}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
        {(fieldState.error?.message || helperText) && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
            {fieldState.error?.message || helperText}
          </Typography>
        )}
      </FormControl>
    )}
  />
);

// Dimensional selector for XBRL dimensions
interface DimensionMember {
  id: string;
  label: string;
  parentId?: string;
  level: number;
}

export const DimensionalSelector: React.FC<BaseFieldProps & {
  dimensions: DimensionMember[];
  multiple?: boolean;
}> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  dimensions,
  multiple = false
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: required ? 'Dieses Feld ist erforderlich' : false }}
    render={({ field, fieldState }) => (
      <Autocomplete
        {...field}
        multiple={multiple}
        options={dimensions}
        getOptionLabel={(option) => option.label}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error || !!fieldState.error}
            helperText={fieldState.error?.message || helperText}
            sx={{ mb: 2 }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ pl: option.level * 2 }}>
            <Typography
              variant={option.level === 0 ? 'subtitle2' : 'body2'}
              color={option.level === 0 ? 'primary.main' : 'text.primary'}
            >
              {option.label}
            </Typography>
          </Box>
        )}
        onChange={(_, value) => field.onChange(value)}
        value={field.value || (multiple ? [] : null)}
      />
    )}
  />
);

// Large text area for comments/descriptions
export const TextAreaField: React.FC<BaseFieldProps & {
  rows?: number;
  maxLength?: number;
}> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  helperText,
  error = false,
  rows = 4,
  maxLength = 2000
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required ? 'Dieses Feld ist erforderlich' : false,
      maxLength: {
        value: maxLength,
        message: `Maximal ${maxLength} Zeichen erlaubt`
      }
    }}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        multiline
        rows={rows}
        label={label}
        error={error || !!fieldState.error}
        helperText={fieldState.error?.message || helperText}
        disabled={disabled}
        inputProps={{ maxLength }}
        sx={{ mb: 2 }}
      />
    )}
  />
);