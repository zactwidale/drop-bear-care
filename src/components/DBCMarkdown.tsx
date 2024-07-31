import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import DBCLink from './DBCLink';
import type { SxProps, Theme } from '@mui/system';

interface DBCMarkdownProps {
  text: string;
  rightJustify?: boolean;
  sx?: SxProps<Theme>;
  functionLinks?: Record<string, () => void>;
  linkLabels?: Record<string, string>;
}

const DBCMarkdown: React.FC<DBCMarkdownProps> = ({
  text,
  rightJustify = false,
  sx = {},
  functionLinks = {},
  linkLabels = {},
}) => {
  return (
    <Box
      sx={{
        ...sx,
        textAlign: rightJustify ? 'right' : 'justify',
        '& h1, & h2': { marginTop: 0 },
      }}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href && href.startsWith('function=')) {
              const functionName = href.split('=')[1];
              return (
                <DBCLink
                  href={href}
                  functionCall={functionLinks[functionName]}
                  ariaLabel={
                    linkLabels[href] || `Activate ${functionName} function`
                  }
                >
                  {children}
                </DBCLink>
              );
            }
            return (
              <DBCLink href={href || ''} ariaLabel={linkLabels[href || '']}>
                {children}
              </DBCLink>
            );
          },
          h1: ({ node, ref, ...props }) => (
            <Typography variant='h5' fontWeight='bold' {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
};

export default DBCMarkdown;
