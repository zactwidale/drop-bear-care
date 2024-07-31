export const firebaseErrorToMessage = (
  code: string,
  mode: 'login' | 'register'
) => {
  switch (code) {
    case 'auth/account-exists-with-different-credential':
    case 'auth/email-already-in-use':
      //TODO - sort out account linking
      //TODO - also need to provide a means to change account credentials
      //TODO - dialog to redirect to login
      return 'You have an account with a different provider.  Please use your original provider or [contact support.](/contact)';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Those credentials do not match our records.  Please try again.';
    case 'auth/invalid-email':
      //TODO - log errors to sentry (if mode is register) - shouldn't get to here
      return mode === 'register'
        ? 'The email address you entered is not valid.  Please try again.'
        : 'Those credentials do not match our records.  Please try again.';
    case 'auth/weak-password':
      //TODO - log errors to sentry - shouldn't get to here
      return 'The password you entered is not strong enough.  Please try again.';
    case 'auth/user-disabled':
      return 'Your account has been disabled.  Please [contact support.](/contact)';
    case 'auth/popup-blocked':
      return 'Your browser has blocked popups.  Please enable popups in your browser settings.';
    case 'auth/operation-not-allowed':
    case 'auth/auth-domain-config-required':
    case 'auth/cancelled-popup-request':
    case 'auth/operation-not-supported-in-this-environment':
    case 'auth/unauthorized-domain':
      //TODO log errors to sentry
      return 'This looks like a bug.  Please [contact support](/contact) and let us know about it.';
    case 'auth/timeout':
      return 'Request timed out.  Please try again later.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts.  Please try again later.';
    default:
      //TODO log errors to sentry
      return 'An unknown error occurred.  Please try again later.';
  }
};
