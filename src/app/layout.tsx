import { config } from 'dotenv';
config();

import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthProvider';
import CookieCheck from '@/components/CookieCheck';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Drop Bear Care',
  description:
    'The new, commission-free, way to connect disability and aged care support workers and carers with those who need them.',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang='en'>
      <body>
        <Suspense fallback={null}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                sx={{
                  height: { xs: 56, sm: 64 }, //MUI defaults for AppBar
                }}
              />
              <CookieCheck>
                <AuthProvider>{children}</AuthProvider>
              </CookieCheck>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
