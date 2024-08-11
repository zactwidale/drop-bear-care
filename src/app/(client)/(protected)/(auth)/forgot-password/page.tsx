'use client';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import DBCMarkdown from '@/components/DBCMarkdown';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
} from '@mui/material';
import { Formik, Form, Field, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { narrowPaper } from '@/lib/constants';
import { getEmailFromCookie } from '@/utils/cookieUtils';
import { EmailLink } from '@/components/EmailLink';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import DBCPaper from '@/components/DBCPaper';

interface FormValues {
  email: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const Login: React.FC = () => {
  const { resetPassword } = useAuth();
  // const emailRef = useRef<HTMLInputElement>(null);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [isSubmittingSocial, setSubmittingSocial] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const cookieEmail = getEmailFromCookie();
    if (cookieEmail) {
      setEmail(cookieEmail);
    }
  }, []);

  // useEffect(() => {
  //   emailRef.current!.focus();
  // }, [router]);

  let initialValues = {
    email: email,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    await resetPassword(values.email);
    setOpenMessageDialog(true);
    setSubmitting(false);
  };

  const handleClose = () => {
    router.push('/');
    setOpenMessageDialog(false);
  };

  const header = `## Forgotten Your Password?
  Don't worry, we've all done it! \n
  Just enter your email address and we'll send you a link to reset it.`;

  const rememberPassword = `Remembered your it? &nbsp;&nbsp;&nbsp;&nbsp;`;

  const message = `We've just sent a a password reset link to: **${email}** \n
  Please check your inbox and follow the instructions to reset your password. \n
  The link will expire in 1 hour. \n
  If the email ends up in you spam folder, move it to your inbox to ensure that the link works. \n
  If you don't receive the email, you may have misspelled your email address.  In which case, simply try again.
  If you have problems, please (contact support)[/contact].`;

  useKeyboardAvoidance();
  return (
    <>
      <DBCLayout title='Password Reset' />
      <DBCPaper sx={{ maxWidth: narrowPaper }}>
        <DBCMarkdown text={header} />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, isSubmitting, setFieldValue }) => (
            <Form>
              <Field
                as={TextField}
                name='email'
                autoComplete='email'
                label='Email'
                // inputRef={emailRef}
                error={hasSubmitted && errors.email}
                helperText={hasSubmitted && errors.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  setFieldValue('email', e.target.value);
                }}
              />
              <Box display='flex' justifyContent='flex-end'>
                <DBCMarkdown text={rememberPassword} />
                <EmailLink email={email} href='/login' sx={{ paddingTop: 2 }}>
                  Return to Login
                </EmailLink>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type='submit'
                  disabled={isSubmitting || isSubmittingSocial}
                  sx={{ marginTop: 2 }}
                  onClick={() => {
                    setHasSubmitted(true);
                  }}
                >
                  {isSubmitting || isSubmittingSocial ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </DBCPaper>

      <Dialog
        open={openMessageDialog}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleClose();
          }
        }}
      >
        <DialogTitle>Done!</DialogTitle>
        <DialogContent>
          <DBCMarkdown text={message} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withPublicRouteProtection(Login);
