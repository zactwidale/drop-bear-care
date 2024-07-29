'use client';
//TODO - get professional opinion on cookie checking
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setCookie, getCookie } from 'cookies-next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DBCMarkdown from './DBCMarkdown';

const alertMessage = `Cookie's are necessary for the function of this site. \n
We use them to help secure our site and your data.  We don't use them to track your activity.

Please enable cookies in your browser and refresh the page to continue.

For more information, please see our [terms and conditions](/legals).`;

export default function CookieCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('cookie-check') === 'needed') {
      setCookie('cookie-check', 'true', { maxAge: 60 * 60 * 24 * 36500 }); // 100 years

      // Check if the cookie was set successfully
      const cookieSet = getCookie('cookie-check');

      if (!cookieSet) {
        setShowModal(true);
      }

      // Remove the query parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('cookie-check');
      router.replace('?' + newSearchParams.toString());
    }
  }, [router, searchParams]);

  return (
    <>
      {children}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Cookies Required</DialogTitle>
        <DialogContent>
          <DBCMarkdown text={alertMessage} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
