'use client';

import DBCAppBar from '@/components/DBCAppBar';
import { useAuth } from '@/contexts/AuthProvider';
import { withOnboardingProtection } from '@/hocs/routeGuards';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
} from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import {
  OnboardingStage,
  getNextOnboardingStage,
  getOnboardingStageName,
  getPreviousOnboardingStage,
  isLastOnboardingStage,
} from '@/types/onboarding';
import OnboardingStepper from './_components/OnboardingStepper';
import EmailVerificationForm from './_components/EmailVerificationForm';
import MembershipTypeForm, {
  type MembershipTypeFormRef,
} from './_components/MembershipTypeForm';
import BioForm, { BioFormRef } from './_components/BioForm';
import PersonalDetailsForm, {
  type PersonalDetailsFormRef,
} from './_components/PersonalDetailsForm';
import PhotosForm, { type PhotosFormRef } from './_components/PhotosForm';
import AvailabilityForm from './_components/AvailabilityForm';
import LoadingPage from '@/components/LoadingPage';

const logoutConfirmation = `
This onboarding process is a necessary part of the process of utilising our services to connect with other members.

If you choose to log out, you will return to this point next time you log in.

For a smoother experience, we recommend completing the onboarding process now.

You can always edit your information and update it via your profile page later.
`;

const Onboarding = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const { signOut, userData, updateUserData } = useAuth();
  const membershipTypeFormRef = useRef<MembershipTypeFormRef>(null);
  const personalDetailsFormRef = useRef<PersonalDetailsFormRef>(null);
  const bioFormRef = useRef<BioFormRef>(null);
  const photosFormRef = useRef<PhotosFormRef>(null);
  const availabilityFormRef = useRef<PersonalDetailsFormRef>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!userData) {
    return <LoadingPage />;
  }

  const handleLogoutClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmLogout = async () => {
    try {
      setOpenDialog(false);
      await signOut();
    } catch (error) {
      //TODO - log to sentry
      console.error('Logout failed:', error);
    }
  };

  const logoutButton = (
    <IconButton color='inherit' onClick={handleLogoutClick} aria-label='logout'>
      <LogoutIcon />
    </IconButton>
  );

  const handleNext = async () => {
    if (userData && !isLastOnboardingStage(userData.onboardingStage)) {
      setIsProcessing(true);
      try {
        if (
          userData.onboardingStage === OnboardingStage.MembershipType &&
          membershipTypeFormRef.current
        ) {
          await membershipTypeFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.PersonalDetails &&
          personalDetailsFormRef.current
        ) {
          await personalDetailsFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Bio &&
          bioFormRef.current
        ) {
          await bioFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Photos &&
          photosFormRef.current
        ) {
          await photosFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Availability &&
          availabilityFormRef.current
        ) {
          await availabilityFormRef.current.submitForm();
        } else {
          const nextStage = getNextOnboardingStage(userData.onboardingStage);
          if (nextStage !== null) {
            await updateUserData({ onboardingStage: nextStage });
            if (nextStage === OnboardingStage.Complete) {
              router.push('/search');
            }
          }
        }
      } catch (error) {
        //TODO - log to sentry
        console.error('Error during next step:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = async () => {
    if (
      userData &&
      userData.onboardingStage !== OnboardingStage.EmailVerification
    ) {
      const prevState = getPreviousOnboardingStage(userData.onboardingStage);
      if (prevState !== null) {
        await updateUserData({ onboardingStage: prevState });
      }
    }
  };

  const onboardingStageComponent = () => {
    switch (userData!.onboardingStage) {
      case OnboardingStage.EmailVerification:
        return <EmailVerificationForm />;
      case OnboardingStage.MembershipType:
        return (
          <MembershipTypeForm
            ref={membershipTypeFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
          />
        );
      case OnboardingStage.PersonalDetails:
        return (
          <PersonalDetailsForm
            ref={personalDetailsFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
          />
        );
      case OnboardingStage.Bio:
        return (
          <BioForm
            ref={bioFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
          />
        );
      case OnboardingStage.Photos:
        return (
          <PhotosForm
            ref={photosFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        );
      case OnboardingStage.Availability:
        return (
          <AvailabilityForm
            ref={availabilityFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
          />
        );
      case OnboardingStage.Complete:
        return <div>Onboarding Complete!</div>;
      default:
        return <div>Unknown Stage</div>;
    }
  };

  return (
    <>
      <DBCAppBar
        title='Onboarding'
        showMenuButton={false}
        rightButton={logoutButton}
      />
      <Paper>
        <DBCMarkdown
          text={`## ${getOnboardingStageName(userData!.onboardingStage)}`}
        />
        {onboardingStageComponent()}
        <OnboardingStepper
          activeStep={userData!.onboardingStage}
          onNext={handleNext}
          onBack={handleBack}
          isProcessing={isProcessing}
        />
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Are you sure you want to log out?</DialogTitle>
        <DialogContent>
          <DBCMarkdown text={logoutConfirmation} />
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button color='secondary' onClick={handleConfirmLogout}>
              Log Out
            </Button>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withOnboardingProtection(Onboarding);
