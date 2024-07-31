import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingPage from '@/components/LoadingPage';
import { isLastOnboardingStage } from '@/types/onboarding';

// Types for better type safety
type AuthState = 'loading' | 'unauthorized' | 'onboarding' | 'authorized';
type OnboardingState = 'loading' | 'unauthorized' | 'onboarding' | 'completed';
type PublicRouteState = 'loading' | 'public' | 'authenticated';

// Reusable redirect function
const useRedirect = () => {
  const router = useRouter();
  return useCallback(
    (path: string) => {
      router.replace(path, { scroll: false });
    },
    [router]
  );
};

export function withAuthProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { user, userData, loading } = useAuth();
    const redirect = useRedirect();
    const [authState, setAuthState] = useState<AuthState>('loading');

    useEffect(() => {
      if (loading) return;
      if (!user) {
        setAuthState('unauthorized');
        redirect('/');
      } else if (userData && !isLastOnboardingStage(userData.onboardingStage)) {
        setAuthState('onboarding');
        redirect('/onboarding');
      } else {
        setAuthState('authorized');
      }
    }, [user, userData, loading, redirect]);

    if (authState !== 'authorized') return <LoadingPage />;
    return <WrappedComponent {...props} />;
  };
}

export function withOnboardingProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedOnboardingRoute(props: P) {
    const { user, userData, loading } = useAuth();
    const redirect = useRedirect();
    const [onboardingState, setOnboardingState] =
      useState<OnboardingState>('loading');

    useEffect(() => {
      if (loading) return;
      if (!user) {
        setOnboardingState('unauthorized');
        redirect('/');
      } else if (userData && !isLastOnboardingStage(userData.onboardingStage)) {
        setOnboardingState('onboarding');
      } else {
        setOnboardingState('completed');
        redirect('/search');
      }
    }, [user, userData, loading, redirect]);

    if (onboardingState !== 'onboarding') return <LoadingPage />;
    return <WrappedComponent {...props} />;
  };
}

export function withPublicRouteProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function PublicRouteProtection(props: P) {
    const { user, loading } = useAuth();
    const redirect = useRedirect();
    const [routeState, setRouteState] = useState<PublicRouteState>('loading');

    useEffect(() => {
      if (loading) return;
      if (user) {
        setRouteState('authenticated');
        redirect('/search');
      } else {
        setRouteState('public');
      }
    }, [user, loading, redirect]);

    if (routeState !== 'public') return <LoadingPage />;
    return <WrappedComponent {...props} />;
  };
}
