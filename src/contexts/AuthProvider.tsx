'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  User,
  onAuthStateChanged,
  getRedirectResult,
  type UserCredential,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import * as authServices from '@/lib/firebase/authServices';
import { OnboardingStage } from '@/types/onboarding';
import { generateAndUploadRandomAvatar } from '@/utils/avatarGenerator';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import type { UserData } from '@/types';

export interface AuthContextProps {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  generateUniqueDisplayName: (
    userId: string,
    firstName: string,
    lastName: string,
    preferredName?: string
  ) => Promise<string>;
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
  sendAccountDeletionEmail: () => Promise<void>;
  handleAccountDeletion: (token: string) => Promise<void>;
  verifyDeletionToken: (token: string) => Promise<boolean>;
}

interface ExtendedUserCredential extends UserCredential {
  _tokenResponse?: {
    providerId?: string;
  };
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleNewUserRegistration = useCallback(
    async (user: User, tokenResponse?: any) => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        let photoURL = user.photoURL || '';

        if (!photoURL) {
          try {
            photoURL = await generateAndUploadRandomAvatar(user.uid);
          } catch (error) {
            console.error('Error generating default avatar:', error);
            photoURL = '/path/to/default-avatar.png';
          }
        } else {
          try {
            photoURL = await uploadProviderPhotoToStorage(user.uid, photoURL);
          } catch (error) {
            console.error('Error uploading provider photo:', error);
            photoURL = await generateAndUploadRandomAvatar(user.uid);
          }
        }

        const newUserData: UserData = {
          uid: user.uid,
          firstName: tokenResponse?.firstName || '',
          lastName: tokenResponse?.lastName || '',
          displayName: '',
          photoURL: photoURL,
          lastActive: Timestamp.fromMillis(Date.now()),
          createdAt: Timestamp.fromMillis(Date.now()),
          onboardingStage: user.emailVerified
            ? OnboardingStage.MembershipType
            : OnboardingStage.EmailVerification,
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
      }
    },
    []
  );

  const generateUniqueDisplayName = async (
    userId: string,
    firstName: string,
    lastName: string,
    preferredName?: string
  ): Promise<string> => {
    const trimmedFirstName = firstName.trim().split(' ')[0];
    const trimmedLastName = lastName.trim();
    const trimmedPreferredName = preferredName?.trim();

    const newBaseName = `${
      trimmedPreferredName || trimmedFirstName
    } ${trimmedLastName.charAt(0)}`;

    return await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();

      // Check if user already has a valid display name
      if (
        userData &&
        userData.displayName &&
        userData.displayName.startsWith(newBaseName)
      ) {
        return userData.displayName;
      }

      const displayNameRef = doc(db, 'displayNames', newBaseName);
      const displayNameDoc = await transaction.get(displayNameRef);

      let finalDisplayName: string;

      if (!displayNameDoc.exists()) {
        finalDisplayName = newBaseName;
        transaction.set(displayNameRef, { count: 1 });
      } else {
        const data = displayNameDoc.data();
        const newCount = (data.count || 0) + 1;
        finalDisplayName = `${newBaseName}-${newCount}`;
        transaction.update(displayNameRef, { count: newCount });
      }

      // Update user document with the new display name
      // NOTE: I would have preferred to do the update in the calling function,
      // but this is often triggered twice in quick succession, creating unfavorable race conditions.
      // Doing it here was a pragmatic compromise.
      transaction.update(userRef, { displayName: finalDisplayName });

      return finalDisplayName;
    });
  };

  const uploadProviderPhotoToStorage = async (
    userId: string,
    photoURL: string
  ): Promise<string> => {
    // Fetch the image
    const response = await fetch(photoURL);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const storage = getStorage();
    const photoRef = ref(storage, `user-photos/${userId}/profile-photo.jpg`);
    await uploadBytes(photoRef, blob);

    // Get the download URL
    return await getDownloadURL(photoRef);
  };

  // const fetchOrCreateUserDoc = useCallback(async (user: User) => {
  //   const userRef = doc(db, 'users', user.uid);
  //   try {
  //     setLoading(true);
  //     const userSnap = await getDoc(userRef);
  //     if (!userSnap.exists()) {
  //       let photoURL = user.photoURL || '';

  //       if (!photoURL) {
  //         try {
  //           photoURL = await generateAndUploadRandomAvatar(user.uid);
  //         } catch (error) {
  //           console.error('Error generating default avatar:', error);
  //         }
  //       }

  //       const newUserData: UserData = {
  //         uid: user.uid,
  //         firstName: '',
  //         lastName: '',
  //         displayName: '',
  //         photoURL: photoURL,
  //         lastActive: Timestamp.fromMillis(Date.now()),
  //         createdAt: Timestamp.fromMillis(Date.now()),
  //         onboardingStage: user.emailVerified
  //           ? OnboardingStage.MembershipType
  //           : OnboardingStage.EmailVerification,
  //         // ... (other fields as needed)
  //       };
  //       await setDoc(userRef, newUserData);
  //       setUserData(newUserData);
  //     } else {
  //       // Existing user, just load their data
  //       setUserData(userSnap.data() as UserData);
  //     }
  //   } catch (error) {
  //     console.error('Error in fetchOrCreateUserDoc:', error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      // Removed setUserData call as it's handled by the listener
    } catch (error) {
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // Check if the user document exists and create it if it doesn't
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await handleNewUserRegistration(firebaseUser);
        }

        // Set up real-time listener for user data
        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            console.error('User document does not exist');
          }
          setLoading(false);
        });

        return () => {
          unsubscribeUser();
        };
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    const handleRedirectResults = async () => {
      try {
        const result = (await getRedirectResult(
          auth
        )) as ExtendedUserCredential | null;
        if (result && result.user) {
          if (result._tokenResponse?.providerId) {
            await handleNewUserRegistration(result.user, result._tokenResponse);
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResults();

    return () => unsubscribeAuth();
  }, [handleNewUserRegistration]);
  const sendAccountDeletionEmail = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    await authServices.sendAccountDeletionEmail(user);
  };

  const handleAccountDeletion = async (token: string) => {
    await authServices.handleAccountDeletion(token);
  };

  const verifyDeletionToken = async (token: string) => {
    return await authServices.verifyDeletionToken(token);
  };

  const value: AuthContextProps = {
    user,
    userData,
    loading,
    generateUniqueDisplayName,
    updateUserData,
    createAccount,
    signIn,
    signOut,
    resetPassword,
    sendVerificationEmail,
    sendAccountDeletionEmail,
    handleAccountDeletion,
    verifyDeletionToken,
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
