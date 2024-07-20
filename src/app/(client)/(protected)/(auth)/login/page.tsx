'use client';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import DBCMarkdown from '@/components/DBCMarkdown';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';
import { Formik, Form, Field, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import { FirebaseError } from '@firebase/util';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';
import { narrowPaper } from '@/lib/constants';
import { getEmailFromCookie } from '@/utils/cookieUtils';
import { EmailLink } from '@/components/EmailLink';
import { firebaseErrorToMessage } from '@/utils/authUtils';
import AccessibleErrorMessage from '@/components/AccessibleErrorMessage';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/withPublicRouteProtection';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [isSubmittingSocial, setSubmittingSocial] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    const cookieEmail = getEmailFromCookie();
    if (cookieEmail) {
      setEmail(cookieEmail);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/search');
      } else {
        emailRef.current?.focus();
      }
    }
  }, [user, loading, router]);

  let initialValues = {
    email: email,
    password: '',
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    await handleLogin('email', values.email, values.password);
    setSubmitting(false);
  };

  const handleLogin = async (
    providerName: string,
    email?: string,
    password?: string
  ) => {
    try {
      setSubmittingSocial(true);
      await signIn(providerName, email, password);
      router.push('/search');
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          setSubmittingSocial(false);
        } else {
          setErrorMessage(firebaseErrorToMessage(error.code, 'login'));
          setOpenErrorDialog(true);
        }
      }
    } finally {
      setSubmittingSocial(false);
    }
  };

  const handleClose = () => {
    setOpenErrorDialog(false);
  };

  const header1 = `## Old School Login`;
  const header2 = `New around here? &nbsp;&nbsp;&nbsp;&nbsp;`;
  const forgotPassword = `Forgot your password? &nbsp;&nbsp;&nbsp;&nbsp;`;

  useKeyboardAvoidance();

  return (
    <>
      <DBCLayout title='Log In' />
      <Paper sx={{ maxWidth: narrowPaper }}>
        <SocialLoginButtons
          disabled={isSubmittingSocial}
          handleClick={handleLogin}
        />
      </Paper>
      <Paper sx={{ maxWidth: narrowPaper }}>
        <DBCMarkdown text={header1} />
        <Box display='flex'>
          <DBCMarkdown text={header2} />
          <EmailLink email={email} href='/register' sx={{ paddingTop: 2 }}>
            Register here
          </EmailLink>
        </Box>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, isSubmitting, setFieldValue }) => (
            <Form noValidate aria-label='Login form'>
              <Field
                as={TextField}
                name='email'
                autoComplete='email'
                label='Email'
                inputRef={emailRef}
                error={hasSubmitted && !!errors.email}
                helperText={hasSubmitted && errors.email}
                aria-required='true'
                aria-invalid={hasSubmitted && !!errors.email}
                aria-describedby='email-error'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  setFieldValue('email', e.target.value);
                }}
              />
              {hasSubmitted && errors.email && (
                <AccessibleErrorMessage
                  id='email-error'
                  message={errors.email}
                />
              )}
              <Field
                as={TextField}
                name='password'
                autoComplete='current-password'
                label='Password'
                type={showPassword ? 'text' : 'password'}
                error={hasSubmitted && !!errors.password}
                helperText={hasSubmitted && errors.password}
                aria-required='true'
                aria-invalid={hasSubmitted && !!errors.password}
                aria-describedby='password-error'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {hasSubmitted && errors.password && (
                <AccessibleErrorMessage
                  id='password-error'
                  message={errors.password}
                />
              )}
              <Box display='flex' justifyContent='flex-end'>
                <DBCMarkdown text={forgotPassword} />
                <EmailLink
                  email={email}
                  href='/forgot-password'
                  sx={{ paddingTop: 2 }}
                >
                  Reset it here
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
                  aria-busy={isSubmitting || isSubmittingSocial}
                >
                  {isSubmitting || isSubmittingSocial ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Login'
                  )}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      <Dialog
        open={openErrorDialog}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleClose();
          }
        }}
      >
        <DialogTitle>Bugger!</DialogTitle>
        <DialogContent>
          <DBCMarkdown text={errorMessage!} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withPublicRouteProtection(Login);
