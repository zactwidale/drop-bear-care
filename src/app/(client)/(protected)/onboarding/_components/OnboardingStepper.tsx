import { MobileStepper, Button, CircularProgress } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { OnboardingStage } from '@/types/onboarding';
import { useAuth } from '@/contexts/AuthProvider';
import { useEffect, useRef, useState } from 'react';
import next from 'next';

interface OnboardingStepperProps {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export default function OnboardingStepper({
  activeStep,
  onNext,
  onBack,
  isProcessing,
}: OnboardingStepperProps) {
  const { user } = useAuth();
  //TODO - responsively change these to use onboarding state names
  const nextLabel =
    activeStep === OnboardingStage.Complete - 1 ? 'Finish' : 'Next';
  const backLabel = 'Back';
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonDimensions, setButtonDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (nextButtonRef.current) {
      const { offsetWidth, offsetHeight } = nextButtonRef.current;
      setButtonDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [nextButtonRef]);

  return (
    <MobileStepper
      variant='dots'
      steps={OnboardingStage.Complete}
      position='static'
      activeStep={activeStep}
      sx={{
        flexGrow: 1,
      }}
      backButton={
        <Button
          color='secondary'
          size='small'
          onClick={onBack}
          disabled={isProcessing || activeStep === 0}
          sx={{
            minWidth: 'auto',
            paddingLeft: '0.5rem',
            paddingRight: '1rem',
          }}
        >
          <KeyboardArrowLeft />
          {backLabel}
        </Button>
      }
      nextButton={
        <Button
          ref={nextButtonRef}
          size='small'
          onClick={onNext}
          disabled={
            isProcessing ||
            activeStep === OnboardingStage.Complete ||
            (activeStep === OnboardingStage.EmailVerification &&
              user!.emailVerified === false)
          }
          sx={{
            minWidth: 'auto',
            paddingLeft: '1rem',
            paddingRight: '0.5rem',
            ...(buttonDimensions.width > 0 && buttonDimensions.height > 0
              ? {
                  width: `${buttonDimensions.width}px`,
                  height: `${buttonDimensions.height}px`,
                }
              : {}),
          }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            <>
              {nextLabel}
              <KeyboardArrowRight />
            </>
          )}
        </Button>
      }
    />
  );
}
