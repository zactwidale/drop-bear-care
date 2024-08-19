'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import UserHeaderButton from '@/components/UserHeaderButton';

const RoadMap = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout
        title='The Road Ahead'
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <Typography>Roadmap</Typography>
    </>
  );
};

export default RoadMap;
