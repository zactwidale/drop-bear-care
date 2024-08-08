import React, { ChangeEvent, useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DBCMarkdown from './DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import DBCPaper from './DBCPaper';

interface UserSearchProps {
  onSearch: () => void;
  isSearching: boolean;
  distance: number;
  setDistance: (distance: number) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSearch,
  isSearching,
  distance,
  setDistance,
}) => {
  const [fontSize, setFontSize] = useState<number>(16); // Default font size
  const { userData } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SLIDER_VALUE = 50;
  const MAX_DISTANCE = 999999;
  const FIELD_WIDTH = '10ch'; // Width for 3 digits plus some padding

  useEffect(() => {
    adjustFontSize();
  }, [distance]);

  const adjustFontSize = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      let fontSize = 16; // Start with default font size

      input.style.fontSize = `${fontSize}px`;
      while (input.scrollWidth > input.clientWidth && fontSize > 8) {
        fontSize--;
        input.style.fontSize = `${fontSize}px`;
      }

      setFontSize(fontSize);
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setDistance(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setDistance(Math.max(0, Math.min(MAX_DISTANCE, value)));
  };

  const header = () => {
    switch (userData?.membershipType) {
      case 'provider':
        return `## Find Potential Clients
            
Look for potential clients within a radius of ${distance} km.`;
      case 'seeker':
        return `## Find Potential Support Workers
Look for potential support workers within a radius of ${distance} km.`;
      default:
        return '';
    }
  };

  return (
    <DBCPaper sx={{ p: 2 }}>
      <DBCMarkdown text={header()} />
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs>
            <Slider
              value={distance > MAX_SLIDER_VALUE ? MAX_SLIDER_VALUE : distance}
              onChange={handleSliderChange}
              aria-labelledby='distance-slider'
              valueLabelDisplay='auto'
              step={1}
              min={0}
              max={MAX_SLIDER_VALUE}
              sx={{ mt: 1.5 }}
            />
          </Grid>
          <Grid item>
            <TextField
              value={distance}
              onChange={handleInputChange}
              inputRef={inputRef}
              inputProps={{
                step: 1,
                min: 0,
                max: MAX_DISTANCE,
                type: 'number',
                'aria-labelledby': 'distance-slider',
                style: {
                  textAlign: 'right',
                  paddingRight: '0.5em',
                  fontSize: `${fontSize}px`,
                  width: FIELD_WIDTH,
                  lineHeight: '1.4375em', // Match MUI's default line height
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>km</InputAdornment>
                ),
                style: { height: '38px' }, // Fixed height
              }}
              sx={{
                width: `calc(${FIELD_WIDTH} + 3ch)`, // Additional space for "km"
                '& .MuiInputBase-root': {
                  width: '100%',
                  height: '38px', // Fixed height
                },
                '& .MuiInputBase-input': {
                  height: '1.4375em', // Match MUI's default height
                  paddingTop: '6px',
                  paddingBottom: '6px',
                },
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                  {
                    marginLeft: '4px',
                  },
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant='contained'
          startIcon={
            isSearching ? <CircularProgress size={20} /> : <SearchIcon />
          }
          onClick={onSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </Box>
    </DBCPaper>
  );
};

export default UserSearch;
