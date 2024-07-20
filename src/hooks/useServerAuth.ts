// import useSWR from "swr";
// import { useEffect } from "react";
// import { auth } from "@/lib/firebase/config";

// interface AuthInfo {
//   isLoggedIn: boolean;
//   photoURL: string | null;
// }

// const fetcher = async (url: string): Promise<AuthInfo> => {
//   const response = await fetch(url, { credentials: "include" });
//   if (!response.ok) {
//     throw new Error("An error occurred while fetching the data.");
//   }
//   return response.json();
// };

// export function useServerAuth() {
//   const {
//     data: authInfo,
//     error,
//     mutate,
//   } = useSWR<AuthInfo>("/api/auth/info", fetcher, {
//     refreshInterval: 30000,
//     revalidateOnFocus: true,
//   });

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         mutate();
//       } else {
//         mutate({ isLoggedIn: false, photoURL: null });
//       }
//     });

//     return () => unsubscribe();
//   }, [mutate]);

//   const signOut = async () => {
//     try {
//       await auth.signOut();
//       await fetch("/api/auth/signout", {
//         method: "POST",
//         credentials: "include",
//       });
//       mutate({ isLoggedIn: false, photoURL: null });
//     } catch (error) {
//       console.error("Error during sign out:", error);
//       throw error;
//     }
//   };

//   return {
//     isLoggedIn: authInfo?.isLoggedIn ?? false,
//     photoURL: authInfo?.photoURL ?? null,
//     signOut,
//     isLoading: !error && !authInfo,
//     error,
//     mutate,
//   };
// }
