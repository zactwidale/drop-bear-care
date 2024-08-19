'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import UserHeaderButton from '@/components/UserHeaderButton';

export default function Contact() {
  const { user } = useAuth();

  return (
    <>
      <DBCLayout
        title='Contact Us'
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <Typography>Contact</Typography>
    </>
  );
}
