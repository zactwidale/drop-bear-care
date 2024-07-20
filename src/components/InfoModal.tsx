import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DBCMarkdown from '@/components/DBCMarkdown';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  closeButtonText?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  closeButtonText = 'Close',
}) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = (
    event: {},
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      onClose();
    }
  };

  const checkScrollable = () => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
      const scrollable = scrollHeight > clientHeight;
      const scrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 1;

      setIsScrollable(scrollable);
      setIsScrolledToBottom(scrolledToBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(checkScrollable, 100);
    }
  }, [isOpen, content]);

  useEffect(() => {
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  const handleScroll = () => {
    checkScrollable();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='info-dialog-title'
      aria-describedby='info-dialog-description'
      disableEscapeKeyDown
      keepMounted
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle id='info-dialog-title' sx={{ marginLeft: -1 }}>
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          position: 'relative',
          padding: 2,
          overflow: 'hidden', // Hide overflow to contain the gradient
        }}
      >
        <Box
          ref={contentRef}
          onScroll={handleScroll}
          sx={{
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 64px - 52px)', // Subtract DialogTitle and DialogActions heights
            pr: 2, // Add right padding for scrollbar
            mr: -2, // Negative margin to compensate for padding
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.2)',
              borderRadius: '4px',
            },
          }}
        >
          <DBCMarkdown text={content} />
        </Box>
        {isScrollable && !isScrolledToBottom && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 40%, rgba(255,255,255,1) 100%)', // Modified gradient
              pointerEvents: 'none',
            }}
          />
        )}
      </DialogContent>
      {isScrollable && !isScrolledToBottom && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce 1s infinite',
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '50%': {
                transform: 'translateX(-50%) translateY(-5px)',
              },
            },
            zIndex: 1,
          }}
        >
          <IconButton
            size='small'
            onClick={() =>
              contentRef.current?.scrollTo({
                top: contentRef.current.scrollHeight,
                behavior: 'smooth',
              })
            }
            aria-label='Scroll to bottom'
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>
      )}
      <DialogActions>
        <Box sx={{ width: '100%', textAlign: 'right' }}>
          <Button onClick={onClose} autoFocus>
            {closeButtonText}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;
