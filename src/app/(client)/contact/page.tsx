'use client';
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { useAuth } from '@/contexts/AuthProvider';

export default function Contact() {
  const { user } = useAuth();

  useKeyboardAvoidance();
  return (
    <>
      <DBCLayout title='Contact Us' showLoginButton />
      <Typography>Contact</Typography>
    </>
  );
}
