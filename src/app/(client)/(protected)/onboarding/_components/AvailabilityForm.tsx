import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Box, FormHelperText } from '@mui/material';
import {
  useAuth,
  type Availability,
  type Suburb,
  type TimeFormat,
} from '@/contexts/AuthProvider';
import SuburbSelector from './SuburbSelector';
import { getNextOnboardingStage } from '@/types/onboarding';
import AvailabilitySelector from './AvailabilitySelector';

interface AvailabilityFormValues {
  location: Suburb | null;
  availability: Availability | null;
  timeFormatPreference: TimeFormat | null;
}

const validationSchema = Yup.object().shape({
  location: Yup.object().nullable().required('Suburb is required'),
});

interface AvailabilityFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface AvailabilityFormRef {
  submitForm: () => Promise<void>;
}

const AvailabilityForm = forwardRef<AvailabilityFormRef, AvailabilityFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<AvailabilityFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (formikRef.current) {
          setHasSubmitted(true);
          await formikRef.current.submitForm();
        }
      },
    }));

    const handleSubmit = async (values: AvailabilityFormValues) => {
      try {
        if (values.location) {
          const nextStage = getNextOnboardingStage(userData!.onboardingStage);
          await updateUserData({
            location: values.location,
            onboardingStage: nextStage!,
          });
          onSubmit();
        }
      } catch (error) {
        // TODO: log to sentry
        console.error('Error updating user data:', error);
      }
    };

    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <Formik
          innerRef={formikRef}
          initialValues={{
            location: userData?.location || null,
            availability: userData?.availability || null,
            timeFormatPreference: userData?.timeFormatPreference || null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, setFieldValue, values }) => (
            <Form noValidate>
              <fieldset
                disabled={disabled}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <Box mt={2} mb={2}>
                  <SuburbSelector
                    onSuburbSelected={(suburb) => {
                      setFieldValue('location', suburb);
                    }}
                    initialValue={values.location}
                  />
                  {hasSubmitted && errors.location && (
                    <FormHelperText error id='location-error'>
                      {errors.location as string}
                    </FormHelperText>
                  )}
                </Box>
                <AvailabilitySelector
                  availability={values.availability}
                  timeFormatPreference={values.timeFormatPreference}
                  onAvailabilityChange={(availability) => {
                    setFieldValue('availability', availability);
                  }}
                  onTimeFormatPreferenceChange={(timeFormatPreference) => {
                    setFieldValue('timeFormatPreference', timeFormatPreference);
                  }}
                />
              </fieldset>
            </Form>
          )}
        </Formik>
      </Box>
    );
  }
);

AvailabilityForm.displayName = 'AvailabilityForm';

export default AvailabilityForm;
