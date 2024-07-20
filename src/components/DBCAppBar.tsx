import React from "react";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface DBCAppBarProps {
  title?: string;
  rightButton?: React.ReactNode;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

const DBCAppBar: React.FC<DBCAppBarProps> = ({
  title = "",
  rightButton = null,
  showMenuButton = true,
  onMenuClick = () => {},
}) => {
  return (
    <AppBar>
      <Toolbar>
        {showMenuButton && (
          <IconButton aria-label="menu" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component="h1"
          noWrap
          style={{ flexGrow: 1, paddingLeft: 16 }}
        >
          {title}
        </Typography>
        {rightButton}
      </Toolbar>
    </AppBar>
  );
};

export default DBCAppBar;
