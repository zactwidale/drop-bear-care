"use client";

import React, { useState } from "react";
import DBCAppBar from "./DBCAppBar";
import DBCDrawer from "./DBCDrawer";
import LoginSplitButton from "./LoginSplitButton";

interface DBCLayoutProps {
  title?: string;
  showLoginButton?: boolean;
}

const DBCLayout: React.FC<DBCLayoutProps> = ({
  title = "",
  showLoginButton = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <DBCAppBar
        title={title}
        rightButton={showLoginButton && <LoginSplitButton />}
        onMenuClick={handleDrawerOpen}
      />
      <DBCDrawer open={drawerOpen} onClose={handleDrawerClose} />
    </>
  );
};
export default DBCLayout;
