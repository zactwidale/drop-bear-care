import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Box, FormHelperText } from '@mui/material';
import { useAuth } from '@/contexts/AuthProvider';
import SuburbSelector from './SuburbSelector';
import { getNextOnboardingStage } from '@/types/onboarding';
import DBCMarkdown from '@/components/DBCMarkdown';
import type { SuburbFirestore, SuburbJSON } from '@/types';
import {
  firestoreToJSON,
  jsonToFirestore,
} from '../../../../../types/location';

interface LocationFormValues {
  location: SuburbJSON | null;
}

const validationSchema = Yup.object().shape({
  location: Yup.object().nullable().required('Suburb is required'),
});

interface LocationFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface LocationFormRef {
  submitForm: () => Promise<void>;
}

const LocationForm = forwardRef<LocationFormRef, LocationFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<LocationFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (formikRef.current) {
          setHasSubmitted(true);
          await formikRef.current.submitForm();
        }
      },
    }));

    const handleSubmit = async (values: LocationFormValues) => {
      try {
        if (values.location) {
          const nextStage = getNextOnboardingStage(userData!.onboardingStage);
          await updateUserData({
            location: jsonToFirestore(values.location),
            onboardingStage: nextStage!,
          });
          onSubmit();
        }
      } catch (error) {
        // TODO: log to sentry
        console.error('Error updating user data:', error);
      }
    };

    const headerMessage = () => {
      switch (userData?.membershipType) {
        case 'provider':
          return `Please tell us where you live, so that we can help you find clients in your neck of the woods.`;
        case 'seeker':
          return `Please tell us where you live, so that we can help you find support workers in your neck of the woods.`;
        default:
          return ``;
      }
    };

    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <DBCMarkdown text={headerMessage()} />
        <Formik
          innerRef={formikRef}
          initialValues={{
            location: firestoreToJSON(userData?.location),
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
              </fieldset>
            </Form>
          )}
        </Formik>
      </Box>
    );
  }
);

LocationForm.displayName = 'LocationForm';

export default LocationForm;
