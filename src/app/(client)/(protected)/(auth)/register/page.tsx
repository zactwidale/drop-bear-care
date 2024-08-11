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
  Typography,
} from '@mui/material';
import { Formik, Form, Field, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import { useAuth, type AuthContextProps } from '@/contexts/AuthProvider';
import { FirebaseError } from '@firebase/util';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';
import { narrowPaper } from '@/lib/constants';
import { EmailLink } from '@/components/EmailLink';
import { getEmailFromCookie } from '@/utils/cookieUtils';
import { firebaseErrorToMessage } from '@/utils/authUtils';
import AccessibleErrorMessage from '@/components/AccessibleErrorMessage';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import DBCPaper from '@/components/DBCPaper';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  //TODO- increase password strength requirements
});

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  // const emailRef = useRef<HTMLInputElement>(null);
  const { signIn, createAccount, sendVerificationEmail, user, loading } =
    useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
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
  //   if (!loading && user) {
  //     router.push('/search');
  //   } else if (!loading && !user) {
  //     emailRef.current!.focus();
  //   }
  // }, [user, loading, router]);

  const initialValues = {
    email: email,
    password: '',
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    await handleAccountCreation('email', values.email, values.password);
    setSubmitting(false);
  };

  const handleAccountCreation: AuthContextProps['signIn'] = async (
    providerName,
    email,
    password
  ) => {
    try {
      setSubmittingSocial(true);
      if (providerName === 'email') {
        await createAccount(email!, password!);
        await sendVerificationEmail();
      } else {
        await signIn(providerName);
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          setSubmittingSocial(false);
          //TODO - figure out why this takes so long
        } else {
          setErrorMessage(firebaseErrorToMessage(error.code, 'register'));
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

  const header1 = `## Old School Email and Password
  For those who don't trust the tech giants.`;

  const header2 = `Already have an account?`;

  useKeyboardAvoidance();

  if (loading) {
    return <LoadingPage />;
  }

  if (user) return null;

  return (
    <>
      <DBCLayout title='Create Account' />
      <DBCPaper sx={{ maxWidth: narrowPaper }}>
        <SocialLoginButtons
          disabled={isSubmittingSocial}
          handleClick={handleAccountCreation}
        />
      </DBCPaper>
      <DBCPaper sx={{ maxWidth: narrowPaper }}>
        <DBCMarkdown text={header1} />
        <Box display='flex' sx={{ marginBottom: 3 }}>
          <Typography variant='body1' sx={{ paddingRight: 3 }}>
            {header2}
          </Typography>
          <EmailLink email={email} href='/login' sx={{ paddingTop: 0 }}>
            Log in here
          </EmailLink>
        </Box>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, isSubmitting, setFieldValue }) => (
            <Form noValidate aria-label='Registration form'>
              <Field
                as={TextField}
                name='email'
                autoComplete='email'
                label='Email'
                // inputRef={emailRef}
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
                autoComplete='new-password'
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type='submit'
                  disabled={isSubmitting || isSubmittingSocial}
                  sx={{ marginTop: 2 }}
                  onClick={() => setHasSubmitted(true)}
                >
                  {isSubmitting || isSubmittingSocial ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </DBCPaper>

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

export default withPublicRouteProtection(Register);
