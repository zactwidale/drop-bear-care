import { forwardRef } from 'react';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';

interface WelcomeFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface WelcomeFormRef {
  submitForm: () => Promise<void>;
}

const WelcomeForm = forwardRef<WelcomeFormRef, WelcomeFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();

    const handleSubmit = async () => {
      try {
        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            onboardingStage: nextStage,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        console.error('Error updating bio and onboarding stage:', error);
      }
    };

    const headerMessage = () => {
      switch (userData?.membershipType) {
        case 'provider':
          return `
Thank you for taking the time to fill in the details on your profile.

You will be able to amend and update these details at any time via your profile page.

You are now free to browse the profiles of members looking for your support.
However, you will not be able to make contact with them until you complete a further
screening process. Nor will your profile be visible to them until this screening
is complete. We trust that you understand the necessity of this screening
in order to protect some very vulnerable members of our community.

Unlike other comparable introduction agencies, we won't be sticking our hand in your
pocket every time you work. This also means that you will be responsible for making your
own agreements with new clients. In the longer term, we hope to offer some assistance
with this process, but we are just getting started. For now, this is a bare-bones service.

We hope that our services will save you a small fortune in commissions!
Once again, thanks for joining us.
`;
        case 'seeker':
          return `
Thank you for taking the time to fill in the details on your profile.

You will be able to amend and update these details at any time via your profile page.

You are now free to browse the profiles of potential support workers and carers.
Please rest assured that any profiles that you see have undergone basic screening.
This includes:
* Identity verification;
* Police check;
* NDIS worker screening check;
* Working with children check.

Unlike with other comparable introduction agencies, your funding goes to those who support
you and not our commissions. Your support workers will be much better paid! This also 
means that you and your support workers will be responsible for making your
own mutually acceptable agreements. In the longer term, we hope to offer some assistance
with this process, but we are just getting started. For now, this is a bare-bones service.

Once again, thanks for joining us.
`;
        default:
          return ``;
      }
    };
    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <DBCMarkdown text={headerMessage()} />
        <Formik initialValues={{}} onSubmit={handleSubmit} />
      </Box>
    );
  }
);

WelcomeForm.displayName = 'WelcomeForm';

export default WelcomeForm;
