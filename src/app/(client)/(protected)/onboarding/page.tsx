'use client';

import DBCAppBar from '@/components/DBCAppBar';
import { useAuth } from '@/contexts/AuthProvider';
import { withOnboardingProtection } from '@/hocs/routeGuards';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import {
  OnboardingStage,
  getNextOnboardingStage,
  getOnboardingStageName,
  getPreviousOnboardingStage,
  isLastOnboardingStage,
} from '@/types/onboarding';
import OnboardingStepper from '@/components/OnboardingAndProfile/OnboardingStepper';
import EmailVerificationForm from '@/components/EmailVerificationForm';
import MembershipTypeForm, {
  type MembershipTypeFormRef,
} from '@/components/OnboardingAndProfile/MembershipTypeForm';
import BioForm, { BioFormRef } from '@/components/OnboardingAndProfile/BioForm';
import PersonalDetailsForm, {
  type PersonalDetailsFormRef,
} from '@/components/OnboardingAndProfile/PersonalDetailsForm';
import PhotosForm, {
  type PhotosFormRef,
} from '@/components/OnboardingAndProfile/PhotosForm';
import LocationForm, {
  type LocationFormRef,
} from '@/components/OnboardingAndProfile/LocationForm';
import AvailabilityForm, {
  type AvailabilityFormRef,
} from '@/components/OnboardingAndProfile/AvailabilityForm';
import LanguagesForm, {
  type LanguagesFormRef,
} from '@/components/OnboardingAndProfile/LanguagesForm';
import WelcomeForm, {
  type WelcomeFormRef,
} from '@/components/OnboardingAndProfile/WelcomeForm';
import LoadingPage from '@/components/LoadingPage';
import DBCPaper from '@/components/DBCPaper';
import UserHeaderButton from '@/components/UserHeaderButton';

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
  const locationFormRef = useRef<LocationFormRef>(null);
  const availabilityFormRef = useRef<AvailabilityFormRef>(null);
  const languagesFormRef = useRef<LanguagesFormRef>(null);
  const welcomeFormRef = useRef<WelcomeFormRef>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [userData?.onboardingStage]);

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
          userData.onboardingStage === OnboardingStage.Location &&
          locationFormRef.current
        ) {
          await locationFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Availability &&
          availabilityFormRef.current
        ) {
          await availabilityFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Languages &&
          languagesFormRef.current
        ) {
          await languagesFormRef.current.submitForm();
        } else if (
          userData.onboardingStage === OnboardingStage.Welcome &&
          welcomeFormRef.current
        ) {
          await welcomeFormRef.current.submitForm();
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
      case OnboardingStage.Location:
        return (
          <LocationForm
            ref={locationFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
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
      case OnboardingStage.Languages:
        return (
          <LanguagesForm
            ref={languagesFormRef}
            onSubmit={handleNext}
            disabled={isProcessing}
          />
        );
      case OnboardingStage.Welcome:
        return (
          <WelcomeForm
            ref={welcomeFormRef}
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
      <div ref={contentRef}>
        <DBCPaper>
          <Box sx={{ position: 'relative', padding: 2 }}>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              <UserHeaderButton />
            </Box>
            {userData!.onboardingStage === OnboardingStage.Welcome ? (
              <DBCMarkdown text={`## Welcome to Drop Bear Care!`} />
            ) : userData!.onboardingStage ===
              OnboardingStage.MembershipType ? null : userData!
                .onboardingStage === OnboardingStage.Availability ? (
              userData!.membershipType === 'provider' ? (
                <DBCMarkdown text={`## Availability`} />
              ) : (
                <DBCMarkdown text={`## Required Support Hours`} />
              )
            ) : (
              <DBCMarkdown
                text={`## ${getOnboardingStageName(userData!.onboardingStage)}`}
              />
            )}
            {onboardingStageComponent()}
            <OnboardingStepper
              activeStep={userData!.onboardingStage}
              onNext={handleNext}
              onBack={handleBack}
              isProcessing={isProcessing}
            />
          </Box>
        </DBCPaper>
      </div>
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
