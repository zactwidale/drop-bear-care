"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";

export function useAuthVerification() {
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          // Token is invalid, sign out the user
          await auth.signOut();
          router.push("/login");
        }
      }
    };

    verifyToken();
    // Set up periodic verification
    const interval = setInterval(verifyToken, 60 * 60 * 1000); // every 60 minutes

    return () => clearInterval(interval);
  }, [router]);
}
