'use client';
import { useState, type ReactNode } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DBCLayout from '@/components/DBCLayout';
import { withAuthProtection } from '@/hocs/routeGuards';

import AccountDeletionForm from '@/components/OnboardingAndProfile/AccountDeletionForm';

// import AccountDetailsForm from '@/components/profile/AccountDetailsForm';
// import MembershipTypeForm from '@/components/profile/MembershipTypeForm';
// import PersonalDetailsForm from '@/components/profile/PersonalDetailsForm';
// import BioForm from '@/components/profile/BioForm';
// import PhotosForm from '@/components/profile/PhotosForm';
// import LocationForm from '@/components/profile/LocationForm';
// import AvailabilityForm from '@/components/profile/AvailabilityForm';
// import LanguagesForm from '@/components/profile/LanguagesForm';

interface ProfileSectionProps {
  title: string;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  children: ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  expanded,
  onChange,
  children,
}) => (
  <Accordion expanded={expanded} onChange={onChange}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

const TempComponent = () => <div></div>;

async function handleSendEmail(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;
  const emailInput = form.elements.namedItem('email') as HTMLInputElement;
  const email = emailInput.value;

  if (!email) {
    alert('Please enter an email address');
    return;
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Test Email',
        text: 'This is a test email sent from our Next.js application.',
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('Test email sent successfully!');
    } else {
      alert(`Failed to send email: ${data.error}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    alert('An error occurred while sending the email.');
  }
}

const Profile = () => {
  const [expanded, setExpanded] = useState<string | false>('accountDetails');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleSave = () => {
    // Implement save functionality
    console.log('Save profile');
  };

  const sections = [
    {
      id: 'accountDetails',
      title: 'Account Details',
      Component: TempComponent,
    },
    {
      id: 'membershipType',
      title: 'Membership Type',
      Component: TempComponent,
    },
    {
      id: 'personalDetails',
      title: 'Personal Details',
      Component: TempComponent,
    },
    { id: 'bio', title: 'Bio', Component: TempComponent },
    { id: 'photos', title: 'Photos', Component: TempComponent },
    { id: 'location', title: 'Location', Component: TempComponent },
    { id: 'availability', title: 'Availability', Component: TempComponent },
    { id: 'languages', title: 'Languages', Component: TempComponent },
    {
      id: 'delete',
      title: 'Account Deletion',
      Component: AccountDeletionForm,
    },
  ];

  return (
    <>
      <DBCLayout title='Edit Profile' />
      <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
        <Typography variant='h4' gutterBottom>
          Edit Your Profile
        </Typography>

        {sections.map(({ id, title, Component }) => (
          <ProfileSection
            key={id}
            title={title}
            expanded={expanded === id}
            onChange={handleChange(id)}
          >
            <Component />
          </ProfileSection>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button variant='contained' color='primary' onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default withAuthProtection(Profile);
