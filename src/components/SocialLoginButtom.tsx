import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface SocialLoginButtonProps {
  title: string;
  logo: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  title,
  logo,
  disabled = false,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{ marginBottom: 1, padding: "2px", width: "15rem" }}
    >
      <Avatar
        sx={{
          backgroundColor: "white",
          marginRight: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
        }}
      >
        {logo}
      </Avatar>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          marginRight: 2,
        }}
      >
        {title}
      </Box>
    </Button>
  );
};

export default SocialLoginButton;
