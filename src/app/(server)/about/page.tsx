"use client";
import Typography from "@mui/material/Typography";
import DBCLayout from "@/components/DBCLayout";
import { useAuth } from "@/contexts/AuthProvider";

export default function About() {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout title="About Us" showLoginButton={!user} />
      <Typography>About</Typography>
    </>
  );
}
