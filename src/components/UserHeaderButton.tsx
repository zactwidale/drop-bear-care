import { useAuth } from '@/contexts/AuthProvider';
import { OnboardingStage } from '../types/onboarding';
import DBCLink from './DBCLink';

// NOTE:  The styling for this happens in the DBCLink - not good design

export default function UserHeaderButton() {
  const { userData } = useAuth();
  return (
    <DBCLink
      href='/profile'
      useButton={true}
      buttonProps={{ variant: 'contained', color: 'primary' }}
      avatar={{ src: userData?.photoURL!, alt: 'User Avatar' }}
      disabled={userData?.onboardingStage !== OnboardingStage.Complete}
    >
      {userData?.onboardingStage &&
      userData?.onboardingStage > OnboardingStage.PersonalDetails
        ? userData?.displayName!
        : 'New User'}
    </DBCLink>
  );
}
