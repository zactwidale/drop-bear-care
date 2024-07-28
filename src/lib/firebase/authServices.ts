import {
  User,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export const createAccount = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error creating account with email and password', error);
    throw error;
  }
};

type Provider = GoogleAuthProvider | FacebookAuthProvider | OAuthProvider;

const addScopesToProvider = (provider: Provider, scopes: string[]) => {
  scopes.forEach((scope) => provider.addScope(scope));
  return provider;
};
export const signIn = async (
  providerName: string,
  email?: string,
  password?: string
) => {
  let provider: Provider;
  switch (providerName) {
    case 'google':
      provider = new GoogleAuthProvider();
      // provider = addScopesToProvider(new GoogleAuthProvider(), [
      //   'email',
      //   'profile',
      // ]);
      break;
    case 'facebook':
      provider = addScopesToProvider(new FacebookAuthProvider(), [
        'email',
        'public_profile',
      ]);
      break;
    case 'microsoft':
      provider = addScopesToProvider(new OAuthProvider('microsoft.com'), [
        'email',
        'profile',
        'user.read',
      ]);
      break;
    case 'apple':
      provider = addScopesToProvider(new OAuthProvider('apple.com'), [
        'email',
        'name',
      ]);
      break;
    case 'email':
      if (email && password) {
        return await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw new Error('Email and password are required');
      }
    default:
      throw new Error('Unsupported provider');
  }
  await signInWithRedirect(auth, provider);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      const additionalUserInfo = (result as any).additionalUserInfo;
      const profile = additionalUserInfo?.profile || {};
      const firstName = profile.given_name || profile.first_name || '';
      const lastName = profile.family_name || profile.last_name || '';
      return {
        user,
        additionalInfo: {
          firstName,
          lastName,
        },
      };
    } else {
      // Check if there's a current user
      const currentUser = auth.currentUser;
      return null;
    }
  } catch (error) {
    console.error('Error handling redirect result:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email', error);
    throw error;
  }
};

export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    } else {
      throw new Error('No user is currently signed in');
    }
  } catch (error) {
    console.error('Error sending email verification', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
