'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { withAuthProtection } from '@/hocs/routeGuards';

const Referrals = () => {
  return (
    <>
      <DBCLayout title='Referrals' />
      <Typography>Referrals</Typography>
    </>
  );
};

export default withAuthProtection(Referrals);
