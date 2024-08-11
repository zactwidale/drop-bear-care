import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { OnboardingStage } from '@/types/onboarding';
import { Box, Button } from '@mui/material';
import { sendVerificationEmail } from '@/lib/firebase/authServices';
import { useCallback, useEffect, useState, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const MIN_POLL_INTERVAL = 5000; // 5 seconds

export default function EmailVerificationForm() {
  const { user, userData, updateUserData } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const lastPollTime = useRef(0);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const lastVerifiedState = useRef<boolean | null>(null);

  const checkEmailVerification = useCallback(async () => {
    console.log('Checking email verification');
    if (user && !user.emailVerified) {
      setIsChecking(true);
      try {
        await user.reload();
        const currentUser = auth.currentUser;
        if (currentUser?.emailVerified) {
          setRefreshKey((prev) => prev + 1); // Force re-render
          if (userData?.onboardingStage === OnboardingStage.EmailVerification) {
            await updateUserData({
              onboardingStage: OnboardingStage.MembershipType,
            });
          }
          lastVerifiedState.current = true;
          return true; // Email verified
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
      } finally {
        setIsChecking(false);
      }
    }
    lastVerifiedState.current = false;
    lastPollTime.current = Date.now();
    return false; // Email not verified
  }, [user, userData, updateUserData]);

  const handleInteraction = useCallback(() => {
    console.log('Interaction detected');
    if (!user?.emailVerified) {
      const now = Date.now();
      const timeSinceLastPoll = now - lastPollTime.current;

      if (timeSinceLastPoll >= MIN_POLL_INTERVAL) {
        // If it's been more than 5 seconds since the last poll, check immediately
        console.log('Checking immediately');
        checkEmailVerification();
      } else {
        // Otherwise, set a timeout for the remaining time
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
        }
        const remainingTime = MIN_POLL_INTERVAL - timeSinceLastPoll;
        console.log(`Setting timeout for ${remainingTime}ms`);
        pollTimeoutRef.current = setTimeout(() => {
          checkEmailVerification();
          pollTimeoutRef.current = null;
        }, remainingTime);
      }
    }
  }, [user, checkEmailVerification]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility changed');
      if (document.visibilityState === 'visible' && !user?.emailVerified) {
        handleInteraction();
      }
    };

    const componentElement = componentRef.current;

    if (componentElement) {
      componentElement.addEventListener('mousemove', handleInteraction);
      componentElement.addEventListener('keydown', handleInteraction);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const unsubscribe = onIdTokenChanged(auth, (user) => {
      console.log('ID token changed');
      if (user) {
        const currentVerifiedState = user.emailVerified;
        if (lastVerifiedState.current !== currentVerifiedState) {
          lastVerifiedState.current = currentVerifiedState;
          handleInteraction();
        }
      }
    });

    return () => {
      if (componentElement) {
        componentElement.removeEventListener('mousemove', handleInteraction);
        componentElement.removeEventListener('keydown', handleInteraction);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [handleInteraction, user]);
  const verifiedMessage = `
Your email address has been verified.
  
Please click the 'Next' button below to continue.
    `;

  const unverifiedMessage = `
As a basic precaution against fake accounts, we require you to verify your email address.

We sent you an email verification link when you registered. Please check your email and click
on the link to verify your email.

If you need another email sending, please click the button below.

**NOTE:** After verifying your email, If you continue to see this message, please manually
check your verification status, below.
`;

  const emailSentMessage = `
We have sent another email to **${user!.email}** with a link to verify it.

Please check your email and click on the link to complete the verification process. 

If you don't see it, please check your spam folder. If you do find it there, please move
it to your inbox before proceeding.

If you still can't find it, please check for typos in your email address and create a new
account if necessary.

If you are still having problems, please [contact us](/contact).

**NOTE:** After verifying your email, If you continue to see this message, please manually
check your verification status, below.
`;

  const handleSendEmail = async () => {
    try {
      setEmailSent(true);
      await sendVerificationEmail();
    } catch (error) {
      //TODO - log to sentry
      console.error('Error sending verification email:', error);
    }
  };

  const handleManualCheck = useCallback(async () => {
    await checkEmailVerification();
    setEmailSent(false);
  }, [checkEmailVerification]);

  if (user?.emailVerified) {
    return <DBCMarkdown text={verifiedMessage} />;
  }

  return (
    <div ref={componentRef} key={refreshKey}>
      <DBCMarkdown text={emailSent ? emailSentMessage : unverifiedMessage} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button onClick={handleManualCheck} color='secondary'>
          Check Verification Status
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleSendEmail}>Resend Verification Email</Button>
      </Box>
    </div>
  );
}
