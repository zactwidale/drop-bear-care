import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  ButtonBase,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { UserData } from '@/types';
import DBCMarkdown from '@/components/DBCMarkdown';
import ChatBubblesIcon from '@/assets/icons/chatbubbles-outline.svg';
import PhotosDisplay from '@/components/PhotosDisplay';
import AvailabilityDisplay from '@/components/AvailabilityDisplay';
import { lastActiveText } from '@/utils/timestampUtils';
import { calculateDistance } from '@/utils/userSearch';
import { commonLanguages } from '@/utils/commonLanguages';
import AvatarViewModal from './AvatarViewModal';

interface FullProfileProps {
  userData: UserData | null;
  currentUserData: UserData;
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onHideProfile: (uid: string, hide: boolean) => Promise<void>;
  onOpenChat: (uid: string) => void;
}

const FullProfile: React.FC<FullProfileProps> = ({
  userData,
  currentUserData,
  open,
  onClose,
  isLoading,
  onHideProfile,
  onOpenChat,
}) => {
  const [hideProfile, setHideProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    'bio'
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (userData) {
      setExpandedAccordion('bio');
    }
  }, [userData]);

  useEffect(() => {
    if (userData && currentUserData && currentUserData.hiddenProfiles) {
      setHideProfile(currentUserData.hiddenProfiles.includes(userData.uid));
    } else {
      setHideProfile(false);
    }
  }, [userData, currentUserData]);

  const calculateDisplayDistance = () => {
    if (userData?.location?.geopoint && currentUserData?.location?.geopoint) {
      const lat1 = userData.location.geopoint.latitude;
      const lon1 = userData.location.geopoint.longitude;
      const lat2 = currentUserData.location.geopoint.latitude;
      const lon2 = currentUserData.location.geopoint.longitude;
      return calculateDistance(lat1, lon1, lat2, lon2);
    }
    return undefined;
  };

  const distance = calculateDisplayDistance();
  const languagesText =
    userData && currentUserData
      ? commonLanguages(userData.languages!, currentUserData.languages!, true)
      : '';

  const handleHideChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!userData) return;

    const newHideState = event.target.checked;
    setIsUpdating(true);
    try {
      await onHideProfile(userData.uid, newHideState);
      setHideProfile(newHideState);
    } catch (error) {
      console.error('Failed to update hidden profile status:', error);
      setHideProfile(!newHideState);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        setExpandedAccordion(panel);
      } else if (panel !== 'bio') {
        setExpandedAccordion('bio');
      } else {
        setExpandedAccordion(false);
      }
    };

  const accordionSections = useMemo(() => {
    const sections = ['availability', 'photos', 'bio'];

    if (!userData?.photoURLs || userData.photoURLs.length === 0) {
      return sections.filter((section) => section !== 'photos');
    }

    return sections;
  }, [userData]);

  const availabilityMessage = () => {
    switch (currentUserData.membershipType) {
      case 'provider':
        return `For better schedule matching, keep your availability up to date in your [profile](/profile).`;
      case 'seeker':
        return `For better schedule matching, keep your required support hours up to date in your [profile](/profile).`;
      default:
        return ``;
    }
  };

  const renderAccordionContent = (section: string) => {
    switch (section) {
      case 'bio':
        return <DBCMarkdown text={userData?.bio || 'No bio available.'} />;
      case 'photos':
        return <PhotosDisplay photos={userData?.photoURLs || []} />;
      case 'availability':
        return userData?.availability ? (
          <>
            <AvailabilityDisplay
              availability={userData.availability}
              currentUserAvailability={currentUserData.availability || []}
              timeFormatPreference={
                currentUserData.timeFormatPreference || '24'
              }
            />
            <DBCMarkdown text={availabilityMessage()} />
          </>
        ) : (
          <Typography>No availability information provided.</Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: 2,
          paddingLeft: 3,
          paddingRight: 6,
          position: 'relative',
        }}
      >
        {isLoading ? (
          <Typography variant='h6' component='div'>
            Loading Profile...
          </Typography>
        ) : userData ? (
          <>
            <ButtonBase onClick={() => setShowAvatarModal(true)}>
              <Avatar
                alt={userData.displayName || 'User'}
                src={userData.photoURL || undefined}
                sx={{ width: 107, height: 107, mr: 3 }}
              />
            </ButtonBase>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant='h5' component='div' sx={{ mb: 1 }}>
                {userData?.displayName || 'User Profile'}
              </Typography>
              {(!userData.hideAge || userData.gender) && (
                <Typography variant='body2' color='text.secondary'>
                  {!userData.hideAge && userData.age
                    ? `${userData.age} years old`
                    : ''}
                  {!userData.hideAge &&
                  userData.age &&
                  userData.gender &&
                  userData.gender !== 'prefer not to say'
                    ? ' • '
                    : ''}
                  {userData.gender && userData.gender !== 'prefer not to say'
                    ? userData.gender
                    : ''}
                </Typography>
              )}
              {userData.location && (
                <Typography variant='body2' color='text.secondary'>
                  {userData.location.suburb}
                  {distance !== undefined && ` (${distance.toFixed(0)}km away)`}
                </Typography>
              )}
              {languagesText && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
                  {languagesText}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='body2' color='text.secondary'>
                Last active:
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {lastActiveText(userData.lastActive)}
              </Typography>
            </Box>
          </>
        ) : null}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.text.primary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 400,
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : userData ? (
          <>
            {accordionSections.map((section) => (
              <Accordion
                key={section}
                expanded={expandedAccordion === section}
                onChange={handleAccordionChange(section)}
                disableGutters
                elevation={4}
                square
                sx={{
                  borderTop: '1px solid rgba(0, 0, 0, .125)',
                  '&:last-of-type': {
                    borderBottom: '1px solid rgba(0, 0, 0, .125)',
                  },
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, .03)',
                    minHeight: 48,
                    '& .MuiAccordionSummary-content': {
                      margin: 0,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 2 }}>
                  {renderAccordionContent(section)}
                </AccordionDetails>
              </Accordion>
            ))}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.12)', // Optional: adds a separator line
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideProfile}
                    onChange={handleHideChange}
                    name='hideProfile'
                    disabled={isUpdating}
                  />
                }
                label='Hide this profile from future searches'
              />
              {isUpdating && <CircularProgress size={24} sx={{ ml: 1 }} />}
              <IconButton
                color='secondary'
                onClick={() => onOpenChat(userData.uid)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ChatBubblesIcon style={{ width: '56px', height: '56px' }} />{' '}
                <Typography variant='body1' sx={{ mt: 0.5 }}>
                  Have a Chat!
                </Typography>
              </IconButton>
            </Box>
          </>
        ) : (
          <Typography sx={{ p: 2 }}>No user data available.</Typography>
        )}{' '}
      </DialogContent>
      <AvatarViewModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarUrl={userData?.photoURL || ''}
      />
    </Dialog>
  );
};

export default FullProfile;
