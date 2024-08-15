import { useState } from 'react';
import {
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';

const DELETION_PHRASE = 'Delete my account';

const AccountDeletionForm = () => {
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleConfirmationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmationPhrase(event.target.value);
  };

  const handleConfirmDelete = async () => {
    if (!user) {
      setError('No user is currently signed in');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Account Deletion Request',
          emailType: 'accountDeletion',
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          'An email with instructions to delete your account has been sent. Please check your inbox.'
        );
        setConfirmationPhrase('');
      } else {
        throw new Error(data.error || 'Failed to send account deletion email');
      }
    } catch (error) {
      console.error('Error initiating account deletion:', error);
      setError(
        'An error occurred while sending the account deletion email. Please try again later.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const mainMessage = `
In the interests of your privacy, account deletion is permanent and can not be undone.

To ensure that you are not doing this by accident, please type the phrase  "**${DELETION_PHRASE}**" below to confirm your intent to delete your account.`;

  const secondaryMessage = `We will send you an email to finalise the deletion of your account.`;

  if (isDeleting) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <DBCMarkdown text={mainMessage} />
      <TextField
        margin='dense'
        label={DELETION_PHRASE}
        type='text'
        variant='outlined'
        value={confirmationPhrase}
        onChange={handleConfirmationChange}
        fullWidth
        sx={{ mt: 2 }}
      />
      <DBCMarkdown text={secondaryMessage} />
      {error && (
        <Typography color='error' sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography color='success.main' sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
        <Button
          variant='contained'
          color='error'
          disabled={
            confirmationPhrase.toLowerCase() !==
              DELETION_PHRASE.toLowerCase() || isDeleting
          }
          sx={{
            borderColor: 'error.main',
            color: 'error.contrastText',
            '&:hover': {
              color: 'error.main',
              backgroundColor: 'error.contrastText',
            },
          }}
          onClick={handleConfirmDelete}
        >
          {isDeleting ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </Box>
    </Box>
  );
};

export default AccountDeletionForm;
