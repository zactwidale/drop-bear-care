import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Grid,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  styled,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type {
  Language,
  LanguageLevel,
  Languages,
} from '@/contexts/AuthProvider';

// Import the language data
import languagesData from '@/assets/languages.json';

interface LanguagesSelectorProps {
  languages: Languages | null;
  onLanguagesChange: (newLanguages: Languages) => void;
}

const languageLevels: LanguageLevel[] = [
  'native',
  'fluent',
  'advanced',
  'intermediate',
  'beginner',
];

const LanguagesSelector: React.FC<LanguagesSelectorProps> = ({
  languages,
  onLanguagesChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<{
    language: string | null;
    level: LanguageLevel | null;
  }>({
    language: null,
    level: null,
  });

  const availableLanguages = languagesData.languages;

  const handleAdd = () => {
    if (newLanguage.language && newLanguage.level) {
      const updatedLanguages = languages
        ? [
            ...languages,
            { language: newLanguage.language, level: newLanguage.level },
          ]
        : [{ language: newLanguage.language, level: newLanguage.level }];
      onLanguagesChange(updatedLanguages);
      setIsDialogOpen(false);
      setNewLanguage({ language: null, level: null });
    }
  };

  const handleDelete = (languageToDelete: Language) => {
    const updatedLanguages = languages!.filter(
      (lang) => lang.language !== languageToDelete.language
    );
    onLanguagesChange(updatedLanguages);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewLanguage({ language: null, level: null });
  };

  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    '& .MuiInputLabel-root': {
      backgroundColor: theme.palette.background.paper,
      padding: '0 4px',
    },
  }));

  return (
    <>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
        }}
      >
        <List sx={{ width: '100%', maxWidth: 600 }}>
          {languages
            ? languages.map((lang) => (
                <ListItem key={lang.language} sx={{ py: 1, px: 0 }}>
                  <Grid container spacing={2} alignItems='center' wrap='nowrap'>
                    <Grid item xs={5}>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 'bold', lineHeight: 1.75 }}
                      >
                        {lang.language}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography sx={{ lineHeight: 1.75 }}>
                        {lang.level}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() => handleDelete(lang)}
                        size='small'
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </ListItem>
              ))
            : null}
        </List>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Fab
          color='primary'
          aria-label='add'
          onClick={() => setIsDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Box>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New Language</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StyledFormControl fullWidth margin='normal'>
                <Autocomplete
                  value={newLanguage.language}
                  onChange={(event, newValue) => {
                    setNewLanguage({ ...newLanguage, language: newValue });
                  }}
                  options={availableLanguages}
                  renderInput={(params) => (
                    <TextField {...params} label='Language' />
                  )}
                  fullWidth
                />
              </StyledFormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Proficiency Level
              </Typography>
              <RadioGroup
                value={newLanguage.level || ''}
                onChange={(e) =>
                  setNewLanguage({
                    ...newLanguage,
                    level: e.target.value as LanguageLevel,
                  })
                }
              >
                {languageLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    value={level}
                    control={<Radio />}
                    label={level}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color='secondary'
            sx={{ marginRight: 'auto', minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            color='primary'
            disabled={!newLanguage.language || !newLanguage.level}
            sx={{ minWidth: 120 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LanguagesSelector;
