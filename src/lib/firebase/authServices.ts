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
  deleteUser,
  reauthenticateWithRedirect,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from 'firebase/storage';

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
      //TODO - get Microsoft user avatar - is available, but more complicated.
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

export const sendAccountDeletionEmail = async (user: User): Promise<void> => {
  try {
    const response = await fetch('/api/send-deletion-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        userId: user.uid,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          data.error || 'Unknown error'
        }`
      );
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to send account deletion email');
    }
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    throw error;
  }
};

export const verifyDeletionToken = async (token: string): Promise<boolean> => {
  const requestDoc = await getDoc(doc(db, 'accountDeletionRequests', token));
  if (!requestDoc.exists()) return false;

  const request = requestDoc.data();
  const now = new Date();

  return !request.used && now < request.expiresAt.toDate();
};

export const handleAccountDeletion = async (token: string): Promise<void> => {
  const isValid = await verifyDeletionToken(token);
  if (!isValid) {
    throw new Error('Invalid or expired token');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    // Re-authenticate based on the provider
    const providers = user.providerData.map((provider) => provider.providerId);

    if (providers.includes('password')) {
      // For email/password users, we need to prompt for the password
      // This should be done in the UI and passed to this function
      throw new Error('Re-authentication required');
    } else if (providers.includes('google.com')) {
      await reauthenticateWithRedirect(user, new GoogleAuthProvider());
    } else if (providers.includes('facebook.com')) {
      await reauthenticateWithRedirect(user, new FacebookAuthProvider());
    } else {
      throw new Error('Unsupported auth provider');
    }

    // Delete user data and account
    await deleteUserData(user.uid);
    await deleteUser(user);

    // Mark the token as used
    await setDoc(
      doc(db, 'accountDeletionRequests', token),
      { used: true },
      { merge: true }
    );
  } catch (error) {
    console.error('Error handling account deletion:', error);
    throw error;
  }
};

export const deleteUserData = async (userId: string) => {
  try {
    // Delete user document
    await deleteDoc(doc(db, 'users', userId));

    // Delete user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    );
    const postsSnapshot = await getDocs(postsQuery);
    postsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Delete user's files from Storage
    const storage = getStorage();
    const userStorageRef = ref(storage, `user-files/${userId}`);
    const filesList = await listAll(userStorageRef);
    const deletePromises = filesList.items.map((fileRef) =>
      deleteObject(fileRef)
    );
    await Promise.all(deletePromises);

    console.log('User data deleted successfully');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};
