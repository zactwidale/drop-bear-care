import { Box, Drawer } from "@mui/material";
import DBCDrawerContent from "./DBCDrawerContent";
import { drawerWidth } from "@/lib/constants";

interface DBCDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DBCDrawer: React.FC<DBCDrawerProps> = ({ open, onClose }) => {
  return (
    <Box component="nav" aria-label="main navigation menu">
      <Drawer variant="temporary" open={open} onClose={onClose}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: drawerWidth,
            height: "100%",
          }}
        >
          <DBCDrawerContent onClose={onClose} />
        </Box>
      </Drawer>
    </Box>
  );
};
export default DBCDrawer;
