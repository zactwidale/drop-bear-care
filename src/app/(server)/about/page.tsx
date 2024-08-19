'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import UserHeaderButton from '@/components/UserHeaderButton';

const About = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout
        title='About Us'
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <Typography>About</Typography>
    </>
  );
};

export default About;
