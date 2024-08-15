import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Box } from '@mui/material';
import { WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true); // Assume online by default
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(window.navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (typeof window === 'undefined') {
    return null; // Return null on server-side
  }

  return (
    <>
      {!isOnline && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 2000,
          }}
        >
          <WifiOff color='red' size={32} />
        </Box>
      )}
      <Snackbar
        open={showOfflineMessage}
        autoHideDuration={6000}
        onClose={() => setShowOfflineMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity='warning'
          variant='filled'
          onClose={() => setShowOfflineMessage(false)}
        >
          You are currently offline. Some features may be unavailable.
        </Alert>
      </Snackbar>
      <Snackbar
        open={showOnlineMessage}
        autoHideDuration={3000}
        onClose={() => setShowOnlineMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity='success'
          variant='filled'
          onClose={() => setShowOnlineMessage(false)}
        >
          Your connection has been restored.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConnectionStatus;
