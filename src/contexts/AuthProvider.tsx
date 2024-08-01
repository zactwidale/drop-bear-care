'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as authServices from '@/lib/firebase/authServices';
import { OnboardingStage } from '@/types/onboarding';

export type Gender = 'male' | 'female' | 'other' | 'prefer not to say';

export interface Suburb {
  id: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
}
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface AvailabilitySlot {
  id: string;
  day: Day;
  startTime: number; // minutes since midnight
  endTime: number; // minutes since midnight
}
export type TimeFormat = '12' | '24';

export type Availability = AvailabilitySlot[];

export interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  photoURL: string;
  createdAt: string;
  onboardingStage: OnboardingStage;
  membershipType?: 'provider' | 'seeker';
  preferredName?: string;
  dateOfBirth?: Date;
  hideAge?: boolean;
  gender?: Gender;
  bio?: string;
  photoURLs?: string[];
  location?: Suburb;
  timeFormatPreference?: TimeFormat;
  availability?: Availability;
}

export interface AuthContextProps {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  signIn: (
    providerName: string,
    email?: string,
    password?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchOrCreateUserDoc(firebaseUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    authServices
      .handleRedirectResult()
      .then((result) => {
        if (result && result.user) {
          handleNewUserRegistration(result.user, result._tokenResponse);
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    return () => unsubscribe();
  }, []);

  const handleNewUserRegistration = async (user: User, tokenResponse?: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // This is a new user, create a new document with social login info
      const newUserData: UserData = {
        uid: user.uid,
        firstName: tokenResponse?.firstName || '',
        lastName: tokenResponse?.lastName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        onboardingStage: OnboardingStage.MembershipType,
        // ... (other fields as needed)
      };
      await setDoc(userRef, newUserData);
      setUserData(newUserData);
    }
    // If the user already exists, we don't update any information
  };

  const fetchOrCreateUserDoc = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    try {
      setLoading(true);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // This is a new user, but not from a social login redirect
        // Create a basic user document
        const newUserData: UserData = {
          uid: user.uid,
          firstName: '',
          lastName: '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          onboardingStage: user.emailVerified
            ? OnboardingStage.MembershipType
            : OnboardingStage.EmailVerification,
          // ... (other fields as needed)
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
      } else {
        // Existing user, just load their data
        setUserData(userSnap.data() as UserData);
      }
    } catch (error) {
      console.error('Error in fetchOrCreateUserDoc:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      setUserData((prevData) => ({ ...prevData!, ...updates }));
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error updating user data', error);
      throw error;
    }
  };
  const createAccount = async (email: string, password: string) => {
    try {
      const userCredential = await authServices.createAccount(email, password);
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const signIn = async (
    providerName: string,
    email?: string,
    password?: string
  ) => {
    try {
      await authServices.signIn(providerName, email, password);
      // The result will be handled in the useEffect hook
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authServices.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authServices.resetPassword(email);
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await authServices.sendVerificationEmail();
    } catch (error) {
      //TODO - log error to sentry
      console.error('Error sending verification email:', error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    user,
    userData,
    loading,
    updateUserData,
    createAccount,
    signIn,
    signOut,
    resetPassword,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
