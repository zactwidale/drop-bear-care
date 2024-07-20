import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import LoadingPage from "@/components/LoadingPage";

export function withPublicRouteProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function PublicRouteProtection(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push("/search");
      }
    }, [user, loading, router]);

    if (loading) {
      return <LoadingPage />;
    }

    if (user) {
      return null; // This will briefly show before the redirect happens
    }

    return <WrappedComponent {...props} />;
  };
}
