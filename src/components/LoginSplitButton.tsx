'use client';
import { useState, useRef, useEffect } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Popper,
  MenuList,
  Box,
} from '@mui/material';
import DBCLink from './DBCLink';

const options = ['Log In', 'Register'];

export default function LoginSplitButton() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [buttonGroupWidth, setButtonGroupWidth] = useState(0);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };
  useEffect(() => {
    if (anchorRef.current) {
      setButtonGroupWidth(anchorRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <>
      <ButtonGroup
        variant='contained'
        ref={anchorRef}
        aria-label='User registration and login'
        sx={{
          borderRadius: 50,
        }}
      >
        <DBCLink href='/register'>
          <Button
            aria-label='Register'
            sx={{
              paddingLeft: 3,
              paddingRight: 2,
            }}
          >
            Register
          </Button>
        </DBCLink>
        <Button
          size='small'
          aria-label='Open login option'
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'
          onClick={handleToggle}
          sx={{
            paddingLeft: 0,
            paddingRight: 1,
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
          width: buttonGroupWidth,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Box sx={{ mt: 1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  id='split-button-menu'
                  autoFocusItem
                  sx={{ padding: 0 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DBCLink href='/login'>
                      <Button
                        color='secondary'
                        sx={{ minWidth: 0, width: buttonGroupWidth }}
                      >
                        Log In
                      </Button>
                    </DBCLink>
                  </Box>
                </MenuList>
              </ClickAwayListener>
            </Box>
          </Grow>
        )}
      </Popper>
    </>
  );
}
