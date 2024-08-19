'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import UserHeaderButton from '@/components/UserHeaderButton';

const Legals = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout
        title='Legal Stuff'
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <Typography>Legals</Typography>
    </>
  );
};

export default Legals;
