import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field, type FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
} from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';

const welcomeMessage = `
## Welcome to Drop Bear!

Our mission is to connect support providers with those who need them - WITHOUT charging on-going commissions.

It's a bare-bones service that doesn't come with bells and whistles.  Just the basics of a platform on which to meet each other,
but giving you the freedom to make your own mutually agreeable arrangements.

So... which side of that equation are you?`;

type MembershipType = 'provider' | 'seeker';

const validationSchema = Yup.object().shape({
  membershipType: Yup.mixed<MembershipType>()
    .oneOf(['provider', 'seeker'] as const, 'Please select a membership type')
    .required('Please select a membership type'),
});

interface MembershipTypeFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface MembershipTypeFormRef {
  submitForm: () => Promise<void>;
}

const MembershipTypeForm = forwardRef<
  MembershipTypeFormRef,
  MembershipTypeFormProps
>(({ onSubmit, disabled = false }, ref) => {
  const { userData, updateUserData } = useAuth();
  const formikRef = useRef<FormikProps<{ membershipType: string }>>(null);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      if (formikRef.current) {
        await formikRef.current.submitForm();
      }
    },
  }));

  const handleSubmit = async (values: { membershipType: string }) => {
    try {
      const membershipType = values.membershipType as MembershipType;
      if (membershipType === 'provider' || membershipType === 'seeker') {
        const nextState = getNextOnboardingStage(userData!.onboardingStage);
        if (nextState !== null) {
          await updateUserData({
            membershipType,
            onboardingStage: nextState,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding state');
        }
      } else {
        throw new Error('Invalid membership type');
      }
    } catch (error) {
      console.error(
        'Error updating membership type and onboarding state:',
        error
      );
      // You might want to add some user-facing error handling here
    }
  };

  return (
    <>
      <DBCMarkdown text={welcomeMessage} />
      <Formik
        innerRef={formikRef}
        initialValues={{ membershipType: userData!.membershipType || '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <FormControl
              component='fieldset'
              disabled={disabled}
              error={touched.membershipType && !!errors.membershipType}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Field name='membershipType'>
                {({ field }: any) => (
                  <RadioGroup
                    {...field}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FormControlLabel
                      value='provider'
                      control={<Radio />}
                      label='Support Provider'
                    />
                    <FormControlLabel
                      value='seeker'
                      control={<Radio />}
                      label='Support Seeker'
                    />
                  </RadioGroup>
                )}
              </Field>
              {touched.membershipType && errors.membershipType && (
                <Typography
                  color='error'
                  variant='body2'
                  sx={{ mt: 1, textAlign: 'center' }}
                >
                  {errors.membershipType}
                </Typography>
              )}
            </FormControl>
          </Form>
        )}
      </Formik>
    </>
  );
});

MembershipTypeForm.displayName = 'MembershipTypeForm';

export default MembershipTypeForm;
