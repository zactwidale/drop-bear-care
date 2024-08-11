'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';

const RoadMap = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout title='The Road Ahead' showLoginButton={!user} />
      <Typography>Roadmap</Typography>
    </>
  );
};

export default withPublicRouteProtection(RoadMap);
