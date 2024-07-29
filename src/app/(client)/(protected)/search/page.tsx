'use client';

import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@mui/material';
import { withAuthProtection } from '@/hocs/routeGuards';

const Search = () => {
  const { user, signOut } = useAuth();
  useKeyboardAvoidance();
  return (
    <>
      <DBCLayout title='Search' />
      <Typography>Search</Typography>
      <Typography>{user?.email}</Typography>
      <Button variant='contained' onClick={signOut}>
        Signout
      </Button>
    </>
  );
};
export default withAuthProtection(Search);
