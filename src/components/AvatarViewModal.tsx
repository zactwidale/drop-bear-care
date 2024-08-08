import React from 'react';
import { Box } from '@mui/material';
import InfoModal from '@/components/InfoModal';
import ResponsiveAvatar from '@/components/ResponsiveAvatar';

interface AvatarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
}

const AvatarViewModal: React.FC<AvatarViewModalProps> = ({
  isOpen,
  onClose,
  avatarUrl,
}) => {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title=''
      content={
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ResponsiveAvatar src={avatarUrl} />
        </Box>
      }
      closeButtonText='Close'
    />
  );
};

export default AvatarViewModal;
