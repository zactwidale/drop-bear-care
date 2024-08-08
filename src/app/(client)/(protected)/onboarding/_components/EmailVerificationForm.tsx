import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { OnboardingStage } from '@/types/onboarding';
import { Box, Button } from '@mui/material';
import { sendVerificationEmail } from '@/lib/firebase/authServices';
import { useState } from 'react';

export default function EmailVerificationForm() {
  const { user, userData, updateUserData } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const verifiedMessage = `
  Your email address has been verified.
  
  Please click the 'Next' button below to continue.
    `;

  const unverifiedMessage = `
  As a basic precaution against fake accounts, we require you to verify your email address.

  We sent you an email verification link when you registered. Please check your email and click on the link to verify your email.

  If you need another email sending, please click the button below.

  If you have verified your email and still see this message, try refreshing the page.
    `;

  const emailSentMessage = `
  We have sent an email to ##${user!.email}## with a link to verify it.

  Please check your email and click on the link to complete the verification process. 

  If you don't see it, please check your spam folder.  If you do find it there, please move to your inbox before proceeding.

  If you still can't find it, please check for typos in your email address and create a new account if necessary.

  If you are still having problems, please [contact us](/contact).

  ##Note:## You will not be able to proceed until your email has been verified.
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

  const handleRefresh = async () => {
    await user?.reload();
    if (
      user?.emailVerified &&
      userData?.onboardingStage === OnboardingStage.EmailVerification
    ) {
      await updateUserData({ onboardingStage: OnboardingStage.MembershipType });
    }
    setEmailSent(false);
  };

  if (user?.emailVerified) {
    return <DBCMarkdown text={verifiedMessage} />;
  }

  return (
    <>
      <DBCMarkdown text={emailSent ? emailSentMessage : unverifiedMessage} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {emailSent ? (
          <Button onClick={handleRefresh}>Refresh Page</Button>
        ) : (
          <Button onClick={handleSendEmail}>Resend Verification Email</Button>
        )}
      </Box>
    </>
  );
}
