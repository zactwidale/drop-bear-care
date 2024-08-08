import React, { useState, useEffect } from 'react';
import {
  List,
  Typography,
  Paper,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { SearchResult, UserData } from '@/types';
import MinProfile from '@/components/MinProfile';
import DBCMarkdown from '@/components/DBCMarkdown';
import DBCPaper from './DBCPaper';

interface SearchResultsProps {
  results: SearchResult[];
  currentUserData: UserData;
  onNewSearch: () => void;
  onOpenChat: (uid: string) => void;
  onViewProfile: (uid: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  currentUserData,
  onNewSearch,
  onOpenChat,
  onViewProfile,
}) => {
  const [showHidden, setShowHidden] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    setFilteredResults(
      showHidden
        ? results
        : results.filter(
            (result) => !currentUserData.hiddenProfiles?.includes(result.uid)
          )
    );
  }, [results, showHidden, currentUserData.hiddenProfiles]);

  const handleToggleHidden = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowHidden(event.target.checked);
  };

  const isProfileHidden = (uid: string) =>
    currentUserData.hiddenProfiles?.includes(uid) || false;

  const noResultsText = `Sorry!  We couldn't find anyone in your neck of the woods. We are still young and 
growing.  Please check back again soon.  Or better still, help us grow the network via our [referral program](/referrals).`;

  const footerText = `Hoping to find more users in your area?  
  
Help us to grow the network via our [referral program](/referrals).`;

  const renderContent = () => {
    if (filteredResults.length === 0) {
      return (
        <>
          <DBCMarkdown text={noResultsText} />

          <Box mt={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant='contained' color='secondary' onClick={onNewSearch}>
              New Search
            </Button>
          </Box>
        </>
      );
    }

    return (
      <>
        <List>
          {filteredResults.map((result) => (
            <MinProfile
              key={result.uid}
              user={result}
              currentUserData={currentUserData}
              onViewProfile={onViewProfile}
              onOpenChat={onOpenChat}
              isHidden={isProfileHidden(result.uid)}
            />
          ))}
        </List>
        <DBCMarkdown text={footerText} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={onNewSearch}>
            New Search
          </Button>
        </Box>
      </>
    );
  };

  return (
    <DBCPaper sx={{ mt: 2, p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>Search Results</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={showHidden}
              onChange={handleToggleHidden}
              sx={{ ml: 1 }}
            />
          }
          label='Show hidden profiles'
          labelPlacement='start'
        />
      </Box>
      {renderContent()}
    </DBCPaper>
  );
};

export default SearchResults;
