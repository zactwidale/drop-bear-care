// import { initializeApp, getApps, cert } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";

// const firebaseAdminConfig = {
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
// };

// export function getFirebaseAdminApp() {
//   if (getApps().length === 0) {
//     return initializeApp({
//       credential: cert(firebaseAdminConfig),
//     });
//   }
//   return getApps()[0];
// }

// export const adminAuth = getAuth(getFirebaseAdminApp());
