'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';

const Legals = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout title='Legal Stuff' showLoginButton={!user} />
      <Typography>Legals</Typography>
    </>
  );
};

export default withPublicRouteProtection(Legals);
