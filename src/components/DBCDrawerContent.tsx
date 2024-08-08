'use client';

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  HomeOutlined as HomeOutlinedIcon,
  AttachMoney as AttachMoneyIcon,
  Map as MapIcon,
  Gavel as GavelIcon,
  InfoOutlined as InfoOutlinedIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  EmailOutlined as EmailOutlinedIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import ChatBubblesIcon from '@/assets/icons/chatbubbles-outline.svg';
import ProfileIcon from '@/assets/icons/koala.svg'; //TODO - better koala icon
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthProvider';

interface DBCListItemProps {
  text: string;
  icon?: React.ReactElement;
  href?: string;
  onClick?: () => void;
}

const DBCListItem: React.FC<DBCListItemProps> = ({
  text,
  icon = null,
  href,
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname === href);
  }, [href]);

  const ListItemButtonUI = () => {
    return (
      <ListItemButton onClick={onClick} selected={isActive}>
        <ListItemIcon>
          <Box sx={{ width: 24, height: 24 }}>{icon}</Box>
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    );
  };

  return (
    <ListItem key={text} disablePadding>
      {href ? (
        <Link
          href={href}
          passHref
          style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
        >
          <ListItemButtonUI />
        </Link>
      ) : (
        <ListItemButtonUI />
      )}
    </ListItem>
  );
};

interface DBCDrawerContentProps {
  onClose: () => void;
}

const DBCDrawerContent: React.FC<DBCDrawerContentProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      <List>
        {user && (
          <>
            <DBCListItem
              text={'Profile'}
              icon={<ProfileIcon />}
              href={'/profile'}
              onClick={onClose}
            />
            <DBCListItem
              text={'Member Search'}
              icon={<SearchIcon />}
              href={'/search'}
              onClick={onClose}
            />
            <DBCListItem
              text={'Chats'}
              icon={<ChatBubblesIcon />}
              href={'/chats'}
              onClick={onClose}
            />
            <DBCListItem
              text={'Referrals Program'}
              icon={<ShareIcon />}
              href={'/referrals'}
              onClick={onClose}
            />
            <Divider />
          </>
        )}
        <DBCListItem text={'Home'} icon={<HomeOutlinedIcon />} href={'/'} />
        <DBCListItem
          text={'About Us'}
          icon={<InfoOutlinedIcon />}
          href={'/about'}
          onClick={onClose}
        />
        <DBCListItem
          text={'Pricing Policies'}
          icon={<AttachMoneyIcon />}
          href={'/pricing'}
          onClick={onClose}
        />
        <DBCListItem text={'Roadmap'} icon={<MapIcon />} href={'/roadmap'} />
        <DBCListItem
          text={'Legal Stuff'}
          icon={<GavelIcon />}
          href={'/legals'}
          onClick={onClose}
        />
        <DBCListItem
          text={'Contact Us'}
          icon={<EmailOutlinedIcon />}
          href={'/contact'}
          onClick={onClose}
        />
      </List>
      <Box sx={{ flex: 1 }} />
      {user && (
        <List>
          <DBCListItem
            text={'Logout'}
            icon={<LogoutIcon />}
            onClick={handleLogout}
          />
        </List>
      )}
    </>
  );
};

export default DBCDrawerContent;
