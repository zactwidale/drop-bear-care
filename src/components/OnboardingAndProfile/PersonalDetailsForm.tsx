import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Formik, Form, Field, type FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-au';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import DBCLink from '@/components/DBCLink';
import InfoModal from '@/components/InfoModal';
import TextFieldWithError from '@/components/TextFieldWithError';
import { Timestamp } from 'firebase/firestore';
import type { Gender } from '@/types';

interface PersonalDetailsFormValues {
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: Date | null;
  hideAge: boolean;
  gender: Gender | '';
}

const isTimestamp = (value: any): value is Timestamp => {
  return value instanceof Timestamp;
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  preferredName: Yup.string(),
  dateOfBirth: Yup.date()
    .nullable()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  hideAge: Yup.boolean(),
  gender: Yup.mixed<Gender>()
    .oneOf(
      ['male', 'female', 'other', 'prefer not to say'] as const,
      'Invalid gender selection'
    )
    .required('Gender selection is required'),
});

interface PersonalDetailsFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface PersonalDetailsFormRef {
  submitForm: () => Promise<void>;
}

const PersonalDetailsForm = forwardRef<
  PersonalDetailsFormRef,
  PersonalDetailsFormProps
>(({ onSubmit, disabled = false }, ref) => {
  const { userData, updateUserData, generateUniqueDisplayName } = useAuth();
  const formikRef = useRef<FormikProps<PersonalDetailsFormValues>>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      if (formikRef.current) {
        setHasSubmitted(true);
        await formikRef.current.submitForm();
      }
    },
  }));

  const calculateAgeRange = (dateOfBirth: Date): string => {
    const today = dayjs();
    const birthDate = dayjs(dateOfBirth);
    const age = today.diff(birthDate, 'year');

    const lowerBound = Math.floor(age / 5) * 5;
    const upperBound = lowerBound + 4;

    return `${lowerBound}-${upperBound}`;
  };

  const handleSubmit = async (values: PersonalDetailsFormValues) => {
    try {
      const nextStage = getNextOnboardingStage(userData!.onboardingStage);
      if (nextStage !== null) {
        let dateOfBirth: Timestamp | null = null;
        let ageRange: string = 'hidden';

        if (values.dateOfBirth) {
          dateOfBirth = Timestamp.fromDate(values.dateOfBirth);
          ageRange = values.hideAge
            ? 'hidden'
            : calculateAgeRange(values.dateOfBirth);
        }

        const displayName = await generateUniqueDisplayName(
          userData!.uid,
          values.firstName,
          values.lastName,
          values.preferredName
        );

        await updateUserData({
          firstName: values.firstName,
          lastName: values.lastName,
          preferredName: values.preferredName,
          dateOfBirth: dateOfBirth!,
          hideAge: values.hideAge,
          age: ageRange,
          gender: values.gender as Gender,
          onboardingStage: nextStage,
          displayName: displayName,
        });
        onSubmit();
      } else {
        throw new Error('Unable to determine next onboarding stage');
      }
    } catch (error) {
      console.error(
        'Error updating basic details and onboarding stage:',
        error
      );
    }
  };

  const handleOpenInfoModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  const headerMessage = () => {
    switch (userData?.membershipType) {
      case 'provider':
        return `Please enter your details as they appear on your legal documents.`;
      case 'seeker':
        return `Please enter your details.`;
      default:
        return ``;
    }
  };

  const infoMessage = () => {
    const commonMessage = `
Your name will be displayed on our site as your given (or preferred) name with the first letter of your last name,
with a number to disambiguate.
          
For example, if John Doe joins up after John Davis, he will get the display name "John D-002".
          
Your age (should you choose to reveal it) will only be displayed as a range (eg 36-40).`;
    switch (userData?.membershipType) {
      case 'provider':
        return `As I am sure you can appreciate, you have chosen to work amongst a community that contains many vulnerable people
and we have an obligation to provide some basic protections to them.
          
Therefore, we will need to verify your identity and do some basic screening before we can allow you to make contact on our platform.
          
Your legal name and date of birth is the first step in this process.
          
We respect your privacy and will not publish or share your details with third parties. Any legal details beyond 
your name, date of birth and gender collected later in the process will be deleted as soon as they have been verified.
          
We believe that better relationships can be formed when not hiding behind the anonymity of the internet. So, we will 
display your real (or preferred) name on our site.

${commonMessage}`;
      case 'seeker':
        return `We respect your privacy and will not publish or share your details with third parties.
          
We also believe that better relationships can be formed when not hiding behind the anonymity of the internet. 
Therefore, we encourage you to use your real name and date of birth.
          
We do require the legal names of those who will be providing you with support.  Their identities will be verified
and screened for your protection before being allowed to make contact with you.
          
${commonMessage}`;
      default:
        return ``;
    }
  };

  const timestampToDayjs = (timestamp: Timestamp | null): Dayjs | null => {
    return timestamp ? dayjs(timestamp.toDate()) : null;
  };

  const dayjsToTimestamp = (date: Dayjs | null): Timestamp | null => {
    return date ? Timestamp.fromDate(date.toDate()) : null;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <DBCMarkdown text={headerMessage()} />
        <Box sx={{ width: '100%', textAlign: 'right', mb: 2 }}>
          <DBCLink
            href='#'
            onClick={handleOpenInfoModal}
            aria-label='Learn why we ask for this information'
          >
            Why do we ask for this information?
          </DBCLink>
        </Box>
        <Formik
          innerRef={formikRef}
          initialValues={{
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            preferredName: userData?.preferredName || '',
            dateOfBirth: userData?.dateOfBirth
              ? userData.dateOfBirth.toDate()
              : null,
            hideAge: userData?.hideAge || false,
            gender: userData?.gender || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, setFieldValue, values }) => (
            <Form noValidate>
              <fieldset
                disabled={disabled}
                style={{ border: 'none', padding: 0, margin: 0 }}
              >
                <TextFieldWithError
                  name='firstName'
                  label='First Name'
                  required
                  autoFocus
                  autoComplete='given-name'
                  hasSubmitted={hasSubmitted}
                />
                <TextFieldWithError
                  name='preferredName'
                  label='Preferred Name (Optional)'
                  autoComplete='nickname'
                  hasSubmitted={hasSubmitted}
                />
                <TextFieldWithError
                  name='lastName'
                  label='Last Name'
                  required
                  autoComplete='family-name'
                  hasSubmitted={hasSubmitted}
                />
                <DatePicker
                  label='Date of Birth *'
                  value={values.dateOfBirth ? dayjs(values.dateOfBirth) : null}
                  onChange={(date: Dayjs | null) => {
                    setFieldValue('dateOfBirth', date ? date.toDate() : null);
                  }}
                  format='DD/MM/YYYY'
                  open={openDatePicker}
                  onOpen={() => setOpenDatePicker(true)}
                  onClose={() => setOpenDatePicker(false)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: hasSubmitted && !!errors.dateOfBirth,
                      helperText:
                        hasSubmitted && (errors.dateOfBirth as string),
                      inputProps: {
                        autoComplete: 'bday',
                        'aria-required': 'true',
                        'aria-invalid': hasSubmitted && !!errors.dateOfBirth,
                        'aria-describedby':
                          hasSubmitted && errors.dateOfBirth
                            ? 'dateOfBirth-error'
                            : undefined,
                        onClick: () => setOpenDatePicker(true),
                      },
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          paddingRight: 4,
                        },
                      },
                    },
                  }}
                />
                {hasSubmitted && errors.dateOfBirth && (
                  <span id='dateOfBirth-error' style={{ display: 'none' }}>
                    {errors.dateOfBirth}
                  </span>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Field as={Checkbox} type='checkbox' name='hideAge' />
                    }
                    label='Hide my age from other users'
                    labelPlacement='start'
                    sx={{
                      margin: 0,
                      '& .MuiFormControlLabel-label': {
                        marginLeft: 0,
                        marginRight: 1,
                      },
                    }}
                  />
                </Box>
                <FormControl
                  component='fieldset'
                  margin='normal'
                  error={hasSubmitted && !!errors.gender}
                  fullWidth
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FormLabel
                      component='legend'
                      sx={{
                        flex: '0 0 25%',
                        pt: 1,
                      }}
                    >
                      Gender: *
                    </FormLabel>
                    <Field
                      as={RadioGroup}
                      name='gender'
                      sx={{
                        flex: '1 1 75%',
                        flexDirection: 'column',
                      }}
                      aria-required='true'
                      aria-invalid={hasSubmitted && !!errors.gender}
                      aria-describedby={
                        hasSubmitted && errors.gender
                          ? 'gender-error'
                          : undefined
                      }
                    >
                      {['male', 'female', 'other', 'prefer not to say'].map(
                        (value) => (
                          <FormControlLabel
                            key={value}
                            value={value}
                            control={<Radio />}
                            label={
                              value.charAt(0).toUpperCase() + value.slice(1)
                            }
                            sx={{ my: -0.5 }}
                          />
                        )
                      )}
                    </Field>
                  </Box>
                  {hasSubmitted && errors.gender && (
                    <FormHelperText error id='gender-error'>
                      {errors.gender}
                    </FormHelperText>
                  )}
                </FormControl>
              </fieldset>
            </Form>
          )}
        </Formik>
      </Box>
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
        title='Why We Ask'
        content={infoMessage()}
      />
    </LocalizationProvider>
  );
});

PersonalDetailsForm.displayName = 'PersonalDetailsForm';

export default PersonalDetailsForm;
