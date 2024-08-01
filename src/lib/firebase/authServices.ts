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
  type UserCredential,
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
      provider = addScopesToProvider(new GoogleAuthProvider(), [
        'email',
        'profile',
      ]);
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

interface ExtendedUserCredential extends UserCredential {
  _tokenResponse?: {
    firstName?: string;
    lastName?: string;
  };
}

export const handleRedirectResult =
  async (): Promise<ExtendedUserCredential | null> => {
    try {
      const result = (await getRedirectResult(auth)) as ExtendedUserCredential;
      return result;
    } catch (error) {
      console.error('Error handling redirect result:', error);
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
