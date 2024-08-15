'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { withAuthProtection } from '@/hocs/routeGuards';

const Chats = () => {
  return (
    <>
      <DBCLayout title='Chats' />
      <Typography>Chats</Typography>
    </>
  );
};

export default withAuthProtection(Chats);
