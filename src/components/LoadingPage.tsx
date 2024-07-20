import React from "react";
import { Box, CircularProgress, useTheme } from "@mui/material";

const LoadingPage: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress
        size={100}
        style={{ color: theme.palette.background.paper }}
      />
    </Box>
  );
};

export default LoadingPage;
