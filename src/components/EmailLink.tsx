'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { setEmailCookie } from '@/utils/cookieUtils';
import DBCLink from './DBCLink';
import type { SxProps, Theme } from '@mui/system';

interface EmailLinkProps {
  email: string;
  href: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

export const EmailLink: React.FC<EmailLinkProps> = ({
  email,
  href,
  sx,
  children,
}) => {
  const router = useRouter();

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    e.preventDefault();
    setEmailCookie(email);
    router.push(href);
  };

  return (
    <DBCLink href={href} onClick={handleClick} sx={sx}>
      {children}
    </DBCLink>
  );
};
