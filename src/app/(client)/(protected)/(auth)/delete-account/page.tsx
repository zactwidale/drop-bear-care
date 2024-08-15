'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DeleteAccountPage() {
  const [message, setMessage] = useState('Deleting account...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Invalid token. Please request a new account deletion link.');
      return;
    }

    const deleteAccount = async () => {
      try {
        const response = await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setMessage('Your account has been successfully deleted.');
          // Optionally, redirect to home page after a delay
          setTimeout(() => router.push('/'), 3000);
        } else {
          setMessage(`Failed to delete account: ${data.error}`);
        }
      } catch (error) {
        setMessage(
          'An error occurred while deleting your account. Please try again later.'
        );
      }
    };

    deleteAccount();
  }, [searchParams, router]);

  return (
    <div>
      <h1>Account Deletion</h1>
      <p>{message}</p>
    </div>
  );
}
