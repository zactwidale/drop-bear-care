import { Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { SxProps, Theme } from "@mui/system";

interface DBCLinkProps {
  href: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
const DBCLink: React.FC<DBCLinkProps> = ({
  href,
  sx = null,
  children,
  onClick = undefined,
}) => {
  const isInternalLink = href && (href.startsWith("/") || href.startsWith("#"));

  if (isInternalLink) {
    return (
      <MuiLink component={NextLink} href={href} sx={sx} onClick={onClick}>
        {children}
      </MuiLink>
    );
  }

  return (
    <MuiLink
      href={href}
      sx={sx}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {children}
    </MuiLink>
  );
};

export default DBCLink;
