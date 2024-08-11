import { useEffect, useState, useCallback } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthProvider';
import { OnboardingStage } from '@/types/onboarding';
import { Box, Button } from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { sendVerificationEmail } from '@/lib/firebase/authServices';

export default function EmailVerificationForm() {
  const { user, userData, updateUserData } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.emailVerified || false);

  const checkAndUpdateVerificationStatus = useCallback(
    async (currentUser: User) => {
      if (currentUser && !isVerified) {
        await currentUser.reload(); // Ensure we have the latest user data
        const newVerificationStatus = currentUser.emailVerified;

        if (newVerificationStatus !== isVerified) {
          setIsVerified(newVerificationStatus);
          if (
            newVerificationStatus &&
            userData?.onboardingStage === OnboardingStage.EmailVerification
          ) {
            await updateUserData({
              onboardingStage: OnboardingStage.MembershipType,
            });
          }
        }
      }
    },
    [isVerified, userData, updateUserData]
  );

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (currentUser) => {
      if (currentUser) {
        checkAndUpdateVerificationStatus(currentUser);
      } else {
        setIsVerified(false);
      }
    });

    // Check immediately in case the user is already verified
    if (user) {
      checkAndUpdateVerificationStatus(user);
    }

    return () => unsubscribe();
  }, [user, checkAndUpdateVerificationStatus]);

  const handleSendEmail = async () => {
    try {
      await sendVerificationEmail();
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  const verifiedMessage = `
  Your email address has been verified.
  
  Please proceed to the next step.
  `;

  const unverifiedMessage = `
  As a basic precaution against fake accounts, we require you to verify your email address.

  We sent you an email verification link when you registered. Please check your email and click on the link to verify your email.

  If you need another email sending, please click the button below.

  **NOTE:** After verifying your email, you will be automatically redirected to the next step.
  `;

  const emailSentMessage = `
  We have sent an email to **${user?.email}** with a link to verify it.

  Please check your email and click on the link to complete the verification process. 

  If you don't see it, please check your spam folder. If you do find it there, please move it to your inbox before proceeding.

  If you still can't find it, please check for typos in your email address and create a new account if necessary.

  If you are still having problems, please [contact us](/contact).

  **NOTE:** Once you've verified your email, you will be automatically redirected to the next step.
  `;

  if (isVerified) {
    return <DBCMarkdown text={verifiedMessage} />;
  }

  return (
    <div>
      <DBCMarkdown text={emailSent ? emailSentMessage : unverifiedMessage} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleSendEmail} disabled={emailSent}>
          {emailSent ? 'Verification Email Sent' : 'Send Verification Email'}
        </Button>
      </Box>
    </div>
  );
}
