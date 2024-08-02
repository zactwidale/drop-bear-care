import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import {
  useAuth,
  type Availability,
  type TimeFormat,
} from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import AvailabilitySelector from './AvailabilitySelector';
import DBCMarkdown from '@/components/DBCMarkdown';

interface AvailabilityFormValues {
  availability: Availability | null;
  timeFormatPreference: TimeFormat | null;
}

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
        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            availability: values.availability || undefined,
            timeFormatPreference: values.timeFormatPreference || undefined,
            onboardingStage: nextStage,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        console.error(
          'Error updating availability and onboarding stage:',
          error
        );
      }
    };

    const headerMessage = () => {
      switch (userData?.membershipType) {
        case 'provider':
          return `Please let your prospective clients know when you are available to provide support.`;
        case 'seeker':
          return `If you've got a schedule of when you require support, please let prospective support workers know.`;
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
            location: userData?.location || null,
            availability: userData?.availability || null,
            timeFormatPreference: userData?.timeFormatPreference || null,
          }}
          onSubmit={handleSubmit}
        >
          {({ errors, setFieldValue, values }) => (
            <Form noValidate>
              <fieldset
                disabled={disabled}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
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
