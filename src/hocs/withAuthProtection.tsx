import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingPage from '@/components/LoadingPage';
import { isLastOnboardingStage } from '@/types/onboarding';

export function withAuthProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    // console.log('withAuthProtection: Rendering', { user, userData, loading });

    useEffect(() => {
      // console.log('withAuthProtection: useEffect', { user, userData, loading });
      if (!loading) {
        if (!user) {
          // console.log('withAuthProtection: No user, redirecting to /');
          router.push('/');
        } else if (
          userData &&
          isLastOnboardingStage(userData.onboardingStage)
        ) {
          // console.log(
          // 'withAuthProtection: Onboarding complete, redirecting to /search'
          // );
        } else {
          // console.log(
          //   'withAuthProtection: User authenticated, onboarding incomplete'
          // );
          router.push('/onboarding');
        }
      }
    }, [user, userData, loading, router]);

    if (loading) {
      // console.log('withAuthProtection: Still loading...');
      return <LoadingPage />;
    }

    if (!user) {
      // console.log('withAuthProtection: No user, returning null');
      return null;
    }

    if (userData && isLastOnboardingStage(userData.onboardingStage)) {
      // console.log('withAuthProtection: Onboarding complete, returning null');
      return null;
    }

    // console.log('withAuthProtection: Rendering wrapped component');
    return <WrappedComponent {...props} />;
  };
}
