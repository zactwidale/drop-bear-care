import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, Formik, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import LanguagesSelector from './LanguagesSelector';
import type { Languages } from '@/types';

interface LanguagesFormValues {
  languages: Languages | null;
}

interface LanguagesFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface LanguagesFormRef {
  submitForm: () => Promise<void>;
}

const LanguagesForm = forwardRef<LanguagesFormRef, LanguagesFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<LanguagesFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (formikRef.current) {
          setHasSubmitted(true);
          await formikRef.current.submitForm();
        }
      },
    }));

    const handleSubmit = async (values: LanguagesFormValues) => {
      try {
        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            languages: values.languages || [],
            onboardingStage: nextStage,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        // TODO: log to sentry
        console.error('Error updating languages and onboarding stage:', error);
      }
    };

    const headerMessage = () => {
      switch (userData?.membershipType) {
        case 'provider':
          return `English might be the official lingo around here, but we are
a beautifully multi-cultural country, with a diverse array of languages. If you
speak any of them - including with your hands - please let your prospective clients
know. It might come in handy!`;
        case 'seeker':
          return `English might be the official lingo around here, but we are
a beautifully multi-cultural country, with a diverse array of languages. If you
have any particular language requirements (or interests) - including sign language - please let
prospective support workers know.`;
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
            languages: userData?.languages || null,
          }}
          onSubmit={handleSubmit}
        >
          {({ errors, setFieldValue, values }) => (
            <Form noValidate>
              <fieldset
                disabled={disabled}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <LanguagesSelector
                  languages={values.languages}
                  onLanguagesChange={(languages) => {
                    setFieldValue('languages', languages);
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

LanguagesForm.displayName = 'LanguagesForm';

export default LanguagesForm;
