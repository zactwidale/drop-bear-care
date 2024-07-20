import React from "react";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import DBCLink from "./DBCLink";
import type { SxProps, Theme } from "@mui/system";

interface DBCMarkdownProps {
  text: string;
  rightJustify?: boolean;
  sx?: SxProps<Theme>;
}

const DBCMarkdown: React.FC<DBCMarkdownProps> = ({
  text,
  rightJustify = false,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        ...sx,
        textAlign: rightJustify ? "right" : "justify",
        "& h1, & h2": { marginTop: 0 },
      }}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <DBCLink href={href || ""}>{children}</DBCLink>
          ),
          h1: ({ node, ref, ...props }) => (
            <Typography variant="h5" fontWeight="bold" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
};

export default DBCMarkdown;
