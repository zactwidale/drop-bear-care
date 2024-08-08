'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { withAuthProtection } from '@/hocs/routeGuards';

const Referrals = () => {
  useKeyboardAvoidance();
  return (
    <>
      <DBCLayout title='Referrals' />
      <Typography>Referrals</Typography>
    </>
  );
};

export default withAuthProtection(Referrals);
