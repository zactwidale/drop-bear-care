import React from 'react';
import { Field, FieldProps } from 'formik';
import { TextField, FormControl, FormHelperText } from '@mui/material';

interface TextFieldWithErrorProps {
  name: string;
  label: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  hasSubmitted: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

const TextFieldWithError: React.FC<TextFieldWithErrorProps> = ({
  name,
  label,
  required = false,
  autoFocus = false,
  autoComplete,
  hasSubmitted,
  fullWidth = true,
  multiline = false,
  rows,
}) => (
  <Field name={name}>
    {({ field, meta }: FieldProps) => (
      <FormControl fullWidth={fullWidth} error={hasSubmitted && !!meta.error}>
        <TextField
          {...field}
          label={label}
          fullWidth={fullWidth}
          margin='normal'
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          required={required}
          error={hasSubmitted && !!meta.error}
          multiline={multiline}
          rows={rows}
          inputProps={{
            'aria-required': required,
            'aria-invalid': hasSubmitted && !!meta.error,
            'aria-describedby':
              hasSubmitted && meta.error ? `${name}-error` : undefined,
          }}
        />
        {hasSubmitted && meta.error && (
          <FormHelperText id={`${name}-error`}>{meta.error}</FormHelperText>
        )}
      </FormControl>
    )}
  </Field>
);

export default TextFieldWithError;
