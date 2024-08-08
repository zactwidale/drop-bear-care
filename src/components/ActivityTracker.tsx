'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const ACTIVITY_PRECISION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function ActivityTracker() {
  const { user, userData, updateUserData } = useAuth();
  const lastActivityRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateLastActivity = useCallback(async () => {
    if (user && userData) {
      const now = Date.now();
      if (now - lastActivityRef.current > ACTIVITY_PRECISION) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const timestamp = Timestamp.now();
          await updateDoc(userRef, { lastActive: timestamp });
          updateUserData({ lastActive: timestamp });
          lastActivityRef.current = now;
        } catch (error) {
          console.error('Error updating last activity:', error);
        }
      }
    }
  }, [user, userData, updateUserData]);

  const debouncedUpdateLastActivity = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(updateLastActivity, 1000); // 1 second debounce
  }, [updateLastActivity]);

  useEffect(() => {
    const handleActivity = () => {
      debouncedUpdateLastActivity();
    };

    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedUpdateLastActivity]);

  return null; // This component doesn't render anything
}
