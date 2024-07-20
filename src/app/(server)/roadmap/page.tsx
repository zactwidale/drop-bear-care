"use client";
import Typography from "@mui/material/Typography";
import DBCLayout from "@/components/DBCLayout";
import { useAuth } from "@/contexts/AuthProvider";

export default function RoadMap() {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout title="The Road Ahead" showLoginButton={!user} />
      <Typography>Roadmap</Typography>
    </>
  );
}
