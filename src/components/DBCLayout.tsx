'use client';

import React, { useState, ReactNode } from 'react';
import DBCAppBar from './DBCAppBar';
import DBCDrawer from './DBCDrawer';
import LoginSplitButton from './LoginSplitButton';

type DBCLayoutBaseProps = {
  title?: string;
};

type DBCLayoutWithLoginButton = DBCLayoutBaseProps & {
  showLoginButton: true;
  rightButton?: never;
};

type DBCLayoutWithRightButton = DBCLayoutBaseProps & {
  showLoginButton?: never;
  rightButton: ReactNode;
};

type DBCLayoutWithoutButton = DBCLayoutBaseProps & {
  showLoginButton?: false;
  rightButton?: never;
};

type DBCLayoutProps =
  | DBCLayoutWithLoginButton
  | DBCLayoutWithRightButton
  | DBCLayoutWithoutButton;

const DBCLayout: React.FC<DBCLayoutProps> = ({
  title = '',
  showLoginButton = false,
  rightButton,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const renderRightButton = () => {
    if (rightButton) {
      return rightButton;
    }
    if (showLoginButton) {
      return <LoginSplitButton />;
    }
    return null;
  };

  return (
    <>
      <DBCAppBar
        title={title}
        rightButton={renderRightButton()}
        onMenuClick={handleDrawerOpen}
      />
      <DBCDrawer open={drawerOpen} onClose={handleDrawerClose} />
    </>
  );
};

export default DBCLayout;
