"use client";
import Typography from "@mui/material/Typography";
import DBCLayout from "@/components/DBCLayout";
import { useKeyboardAvoidance } from "@/hooks/useKeyboardAvoidance";
import { withAuthProtection } from "@/hocs/withAuthProtection";

const Chats = () => {
  useKeyboardAvoidance();

  return (
    <>
      <DBCLayout title="Chats" />
      <Typography>Chats</Typography>
    </>
  );
};

export default withAuthProtection(Chats);
