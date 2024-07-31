import React from 'react';
import { Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';
import { SxProps, Theme } from '@mui/system';

interface DBCLinkProps {
  href: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  ariaLabel?: string;
  functionCall?: () => void;
}

const DBCLink: React.FC<DBCLinkProps> = ({
  href,
  sx = null,
  children,
  onClick,
  ariaLabel,
  functionCall,
}) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));
  const isFunctionLink = href.startsWith('function=');
  const isExternalLink = !isInternalLink && !isFunctionLink;

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (isFunctionLink) {
      e.preventDefault();
      if (functionCall) {
        functionCall();
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  if (isFunctionLink) {
    return (
      <MuiLink
        component='button'
        onClick={handleClick}
        sx={sx}
        aria-label={ariaLabel}
        role='button'
      >
        {children}
      </MuiLink>
    );
  }

  if (isInternalLink) {
    return (
      <MuiLink
        component={NextLink}
        href={href}
        sx={sx}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </MuiLink>
    );
  }

  if (isExternalLink) {
    return (
      <MuiLink
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        sx={sx}
        onClick={onClick}
        aria-label={`${ariaLabel || children} (opens in a new tab)`}
      >
        {children}
        <span className='visually-hidden'>(opens in a new tab)</span>
      </MuiLink>
    );
  }

  // Default case, should not typically be reached
  return (
    <MuiLink href={href} sx={sx} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </MuiLink>
  );
};

export default DBCLink;
