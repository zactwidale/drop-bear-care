'use client'; //TODO - find a way to access user state without use client
import Typography from '@mui/material/Typography';
import DBCLayout from '@/components/DBCLayout';
import { useAuth } from '@/contexts/AuthProvider';
import UserHeaderButton from '@/components/UserHeaderButton';
import Image from 'next/image';
import { Box, Container, styled } from '@mui/material';

export default function Home() {
  const { user } = useAuth();

  const StyledImage = styled(Image)(({ theme }) => ({
    width: 300,
    height: 259,
    [theme.breakpoints.up('sm')]: {
      width: 400,
      height: 345,
    },
  }));

  return (
    <>
      <DBCLayout
        title=''
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <Container maxWidth='lg'>
        <Box
          component='h1'
          sx={{
            mt: { xs: 2, md: 0 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            component='span'
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              m: 0,
              p: 0,
            }}
          >
            Welcome
          </Typography>
          <StyledImage
            src='/logo.png'
            alt='Drop Bear Care Logo'
            width={500}
            height={431}
            priority
          />
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ width: { xs: '20%', sm: '30%' } }} />
            <Typography
              component='span'
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 400,
              }}
            >
              to
            </Typography>
            <Box sx={{ display: 'flex', flex: 2 }} />
          </Box>
          <Typography
            component='span'
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              m: 0,
              p: 0,
            }}
          >
            Drop Bear Care
          </Typography>
        </Box>
        <Box
          sx={{
            maxWidth: '90%',
            textAlign: 'center',
            mx: 'auto',
          }}
        >
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 400,
              mt: 1.5,
            }}
          >
            The new, <strong>commission-free</strong> way to connect support
            workers with those who need them.
          </Typography>
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 400,
              mt: 4,
            }}
          >
            <strong>Let&apos;s put the fat-cat middle-men on a diet!</strong>
          </Typography>
        </Box>
      </Container>
    </>
  );
}
