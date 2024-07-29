'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { withAuthProtection } from '@/hocs/routeGuards';

const Profile = () => {
  useKeyboardAvoidance();
  return (
    <>
      <DBCLayout title='Profile' />
      <Typography>Profile</Typography>
    </>
  );
};

export default withAuthProtection(Profile);
