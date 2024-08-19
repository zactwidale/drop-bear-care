import React from 'react';
import { Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';
import { SxProps, Theme } from '@mui/system';
import Button, { ButtonProps } from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

interface DBCLinkProps {
  href: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  ariaLabel?: string;
  functionCall?: () => void;
  useButton?: boolean;
  buttonProps?: Omit<ButtonProps, 'href' | 'onClick' | 'disabled'>;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  avatar?: {
    src?: string;
    alt?: string;
    children?: React.ReactNode;
  };
  disabled?: boolean;
}

const DBCLink: React.FC<DBCLinkProps> = ({
  href,
  sx = null,
  children,
  onClick,
  ariaLabel,
  functionCall,
  useButton = false,
  buttonProps,
  startIcon,
  endIcon,
  avatar,
  disabled = false,
}) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));
  const isFunctionLink = href.startsWith('function=');
  const isExternalLink = !isInternalLink && !isFunctionLink;

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (isFunctionLink) {
      e.preventDefault();
      if (functionCall) {
        functionCall();
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  const commonProps = {
    onClick: handleClick,
    'aria-label': ariaLabel,
    tabIndex: disabled ? -1 : undefined,
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        pr: avatar ? 3 : 0,
      }}
    >
      {children}
      {avatar && (
        <Avatar
          src={avatar.src}
          alt={avatar.alt}
          sx={{
            position: 'absolute',
            right: -28,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 36,
            height: 36,
          }}
        >
          {avatar.children}
        </Avatar>
      )}
    </Box>
  );

  if (useButton) {
    const buttonSx: SxProps<Theme> = {
      ...(sx as object),
      ...(buttonProps?.sx as object),
      overflow: 'visible',
    };

    return (
      <Button
        component={isInternalLink && !disabled ? NextLink : 'a'}
        href={disabled ? undefined : href}
        target={isExternalLink && !disabled ? '_blank' : undefined}
        rel={isExternalLink && !disabled ? 'noopener noreferrer' : undefined}
        startIcon={startIcon}
        endIcon={endIcon}
        {...commonProps}
        {...buttonProps}
        disabled={disabled}
        sx={buttonSx}
      >
        {content}
        {isExternalLink && !disabled && (
          <span className='visually-hidden'>(opens in a new tab)</span>
        )}
      </Button>
    );
  }

  const LinkComponent = disabled ? 'span' : MuiLink;

  return (
    <LinkComponent
      {...(isInternalLink && !disabled ? { component: NextLink, href } : {})}
      {...(!isInternalLink && !disabled ? { href } : {})}
      {...(isExternalLink && !disabled
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      {...commonProps}
      {...(disabled ? { role: 'presentation' } : {})}
      {...(isFunctionLink && !disabled
        ? { component: 'button', role: 'button' }
        : {})}
      sx={sx}
    >
      {content}
      {isExternalLink && !disabled && (
        <span className='visually-hidden'>(opens in a new tab)</span>
      )}
    </LinkComponent>
  );
};

export default DBCLink;
