'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';

const About = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout title='About Us' showLoginButton={!user} />
      <Typography>About</Typography>
    </>
  );
};

export default withPublicRouteProtection(About);
