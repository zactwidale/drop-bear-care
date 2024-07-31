import { Avatar, Box } from '@mui/material';

const ResponsiveAvatar = ({ src }: { src: string }) => {
  return (
    <Box
      sx={{
        width: '100%',
        paddingBottom: '100%', // This creates a 1:1 aspect ratio
        position: 'relative',
      }}
    >
      <Avatar
        src={src}
        alt='User avatar'
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
  );
};

export default ResponsiveAvatar;
