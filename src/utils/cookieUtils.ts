//TODO - get professional opinion of security

import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const COOKIE_NAME = "user_email";
const MAX_AGE = 2; //seconds
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-secret-key";

export function setEmailCookie(email: string): void {
  const encryptedEmail = CryptoJS.AES.encrypt(email, SECRET_KEY).toString();
  Cookies.set(COOKIE_NAME, encryptedEmail, {
    expires: new Date(new Date().getTime() + MAX_AGE * 1000),
    domain: DOMAIN,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function getEmailFromCookie(): string | null {
  const encryptedEmail = Cookies.get(COOKIE_NAME);

  if (!encryptedEmail) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedEmail, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Failed to decrypt email:", error);
    return null;
  }
}
