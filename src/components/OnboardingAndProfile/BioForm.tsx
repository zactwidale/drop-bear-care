import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Formik, Form, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import TextFieldWithError from '@/components/TextFieldWithError';
import {
  moderateContent,
  type ModerationResult,
} from '@/services/moderationService';
import InfoModal from '@/components/InfoModal';

interface BioFormValues {
  bio: string;
}

const validationSchema = Yup.object().shape({
  bio: Yup.string().required('Tell us something!'),
});

interface BioFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface BioFormRef {
  submitForm: () => Promise<void>;
}

const BioForm = forwardRef<BioFormRef, BioFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<BioFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isModeratingContent, setIsModeratingContent] = useState(false);
    const [moderationError, setModerationError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (formikRef.current) {
          setHasSubmitted(true);
          await formikRef.current.submitForm();
        }
      },
    }));

    const handleSubmit = async (values: BioFormValues) => {
      try {
        setIsModeratingContent(true);
        setModerationError(null);

        const moderationResult: ModerationResult = await moderateContent(
          values.bio
        );

        if (!moderationResult.isApproved) {
          switch (moderationResult.reason) {
            case 'inappropriate':
              setModerationError(`Google's AI content moderation service has flagged your bio as containing
potentially inapropriate or offensive language.

If you feel that it has been excessively politically correct, please [let us know.](/contact) and we
will consider how we can fine tune it.

In the meantime, please try again with less provocative language.`);
              return;
            case 'contactInfo':
              setModerationError(`Google's AI content moderation service has flagged your bio as containing
contact or personal information.

These details may be shared freely in one-on-one chats with other users, but we ask that you do not share
them in you profile.`);
              return;
            default:
              setModerationError(
                `An error occurred while processing your submission.`
              );
              return;
          }
        }

        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            bio: values.bio,
            onboardingStage: nextStage,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        console.error('Error updating bio and onboarding stage:', error);
        setModerationError(
          'An error occurred while processing your submission. Please [let us know.](/contact) and we will investigate what went wrong.'
        );
      } finally {
        setIsModeratingContent(false);
      }
    };

    const headerMessage = () => {
      switch (userData?.membershipType) {
        case 'provider':
          return `Please tell us about yourself.  Include your experience, not just as it relates to support work, 
but general life experiences.  You never know which skills are going to come in handy in this industry.  Also, don't
forget to tell us what makes you tick as a person.  Reveal your personality!  It's the personal connections that
really make a difference to those you support.`;
        case 'seeker':
          return `Please tell us about yourself.  Include your needs as they relate to the support you seek, 
but don't forget to tell us what makes you tick as a person.  You are more than your disability!  So tell us
who you REALLY are!`;
        default:
          return ``;
      }
    };

    const footerMessage = `Optional: If you'd like to add a little flair to your bio, it will be rendered using [Markdown styling](https://www.markdownguide.org).`;

    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <DBCMarkdown text={headerMessage()} />
        <Formik
          innerRef={formikRef}
          initialValues={{
            bio: userData?.bio || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <fieldset
                disabled={disabled || isSubmitting || isModeratingContent}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <TextFieldWithError
                  name='bio'
                  label='Bio'
                  required
                  autoFocus
                  multiline
                  rows={12}
                  hasSubmitted={hasSubmitted}
                />
              </fieldset>
            </Form>
          )}
        </Formik>
        <DBCMarkdown text={footerMessage} />
        <InfoModal
          isOpen={moderationError !== null}
          onClose={() => setModerationError(null)}
          title='Content Moderation Error'
          content={moderationError!}
          closeButtonText='Try Again'
        />
      </Box>
    );
  }
);

BioForm.displayName = 'BioForm';

export default BioForm;
