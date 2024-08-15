import { Typography, Box } from '@mui/material';

export default function AccountDeletedPage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Account Deleted
      </Typography>
      <Typography>
        {`Your account has been successfully deleted. We're sorry to see you go.`}
      </Typography>
    </Box>
  );
}
