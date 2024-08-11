import { Avatar, Typography, Box, useTheme, IconButton } from '@mui/material';
import {
  SearchResult,
  type Availability,
  type Languages,
  type UserData,
} from '@/types';
import ChatBubblesIcon from '@/assets/icons/chatbubbles-outline.svg';
import { lastActiveText, reconstructTimestamp } from '@/utils/timestampUtils';
import { commonLanguages } from '@/utils/commonLanguages';

interface MinProfileProps {
  user: SearchResult;
  currentUserData: UserData;
  onViewProfile: (uid: string) => void;
  onOpenChat: (uid: string) => void;
  isHidden: boolean;
}

const commonAvailability = (
  userAvailability: Availability | undefined,
  currentUserAvailability: Availability | undefined
): string => {
  if (!userAvailability || !currentUserAvailability) {
    return '';
  }

  let totalOverlapMinutes = 0;

  userAvailability.forEach((userSlot) => {
    currentUserAvailability.forEach((currentUserSlot) => {
      if (userSlot.day === currentUserSlot.day) {
        const overlapStart = Math.max(
          userSlot.startTime,
          currentUserSlot.startTime
        );
        const overlapEnd = Math.min(userSlot.endTime, currentUserSlot.endTime);

        if (overlapEnd > overlapStart) {
          totalOverlapMinutes += overlapEnd - overlapStart;
        }
      }
    });
  });

  const overlapHours = totalOverlapMinutes / 60;

  if (overlapHours > 0) {
    return `${overlapHours.toFixed(1)}hrs schedule match!`;
  }

  return '';
};

const MinProfile: React.FC<MinProfileProps> = ({
  user,
  currentUserData,
  onViewProfile,
  onOpenChat,
  isHidden,
}) => {
  const theme = useTheme();

  const commonLangsText = commonLanguages(
    user.languages,
    currentUserData.languages!
  );
  const commonAvailText = commonAvailability(
    user.availability!,
    currentUserData.availability!
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px solid',
        borderColor: theme.palette.primary.main,
        borderRadius: 100,
        padding: 1,
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
      onClick={() => onViewProfile(user.uid)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Avatar
          alt={user.displayName || 'User'}
          src={user.photoURL || undefined}
        />
        <Box sx={{ ml: 2 }}>
          <Typography
            sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
            variant='body1'
            color='text.primary'
          >
            {user.displayName || 'Anonymous User'}
            {isHidden && (
              <Typography
                sx={{ display: 'inline', pl: 1, whiteSpace: 'nowrap' }}
                component='span'
                variant='body2'
                color='text.secondary'
              >
                (Hidden)
              </Typography>
            )}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {`${user.suburb} (${user.distance.toFixed(0)}km)`}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box>
        <Typography variant='body2' color='text.primary'>
          {commonLangsText}
        </Typography>
        <Typography variant='body2' color='text.primary'>
          {commonAvailText}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography variant='body2' color='text.primary'>
            Last active:
          </Typography>
          <Typography variant='body2' color='text.primary'>
            {lastActiveText(reconstructTimestamp(user.lastActive!))}
          </Typography>
        </Box>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onOpenChat(user.uid);
          }}
          sx={{
            '& svg': {
              width: 40,
              height: 40,
              color: theme.palette.secondary.main,
            },
          }}
        >
          <ChatBubblesIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MinProfile;
