'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { withAuthProtection } from '@/hocs/routeGuards';
import UserHeaderButton from '@/components/UserHeaderButton';

const Referrals = () => {
  return (
    <>
      <DBCLayout title='Referrals' rightButton={<UserHeaderButton />} />
      <Typography>Referrals</Typography>
    </>
  );
};

export default withAuthProtection(Referrals);
