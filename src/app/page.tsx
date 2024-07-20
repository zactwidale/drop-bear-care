"use client"; //TODO - find a way to access user state without use client
import Typography from "@mui/material/Typography";
import DBCLayout from "@/components/DBCLayout";
import { useAuth } from "@/contexts/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <DBCLayout title="Home Page" showLoginButton={!user} />
      <Typography>Home</Typography>
      <p>{user ? <>{user.email}</> : <>Logged out</>}</p>
    </>
  );
}
