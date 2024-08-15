import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import type { SuburbJSON, SuburbFirestore } from '@/types';
import suburbsData from '@/assets/suburbs.json';
import DBCPaper from '@/components/DBCPaper';

interface SuburbSelectorProps {
  onSuburbSelected: (suburb: SuburbJSON | null) => void;
  initialValue?: SuburbJSON | null;
  autoFocus?: boolean;
}

const SuburbSelector: React.FC<SuburbSelectorProps> = ({
  onSuburbSelected,
  initialValue = null,
  autoFocus = false,
}) => {
  const [suburbs, setSuburbs] = useState<SuburbJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [selectedSuburb, setSelectedSuburb] = useState<SuburbJSON | null>(
    initialValue
  );

  useEffect(() => {
    setSuburbs(suburbsData);
    setLoading(false);
  }, []);

  const filterOptions = useCallback(
    (options: SuburbJSON[], { inputValue }: { inputValue: string }) => {
      const searchTerm = inputValue.toLowerCase().trim();
      if (searchTerm.length < 2) return [];
      const filtered = options.filter((option) => {
        const matchSuburb = option.suburb.toLowerCase().includes(searchTerm);
        const matchPostcode = option.postcode === searchTerm;
        const matchState = option.state.toLowerCase() === searchTerm;
        return matchSuburb || matchPostcode || matchState;
      });
      return filtered.slice(0, 25);
    },
    []
  );

  const getOptionLabel = useCallback(
    (option: SuburbJSON) =>
      `${option.suburb}, ${option.state} ${option.postcode}`,
    []
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: SuburbJSON) => (
      <li {...props} key={option.id}>
        <Box display='flex'>
          <Typography variant='body1' mr={1}>
            {option.suburb}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {option.state} {option.postcode}
          </Typography>
        </Box>
      </li>
    ),
    []
  );

  if (loading) {
    return (
      <Box display='flex' alignItems='center'>
        <CircularProgress size={20} />
        <Typography ml={1}>Loading suburbs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Autocomplete<SuburbJSON, false, false, false>
        options={suburbs}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        filterOptions={filterOptions}
        value={selectedSuburb}
        onChange={(_, value) => {
          setSelectedSuburb(value);
          onSuburbSelected(value);
        }}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        inputValue={inputValue}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Suburb'
            variant='outlined'
            required
            autoFocus={autoFocus}
          />
        )}
        PaperComponent={({ children }) => (
          <DBCPaper
            sx={{
              minWidth: '100%',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            {children}
          </DBCPaper>
        )}
        disableListWrap
        noOptionsText='No suburbs found'
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </Box>
  );
};

export default SuburbSelector;
