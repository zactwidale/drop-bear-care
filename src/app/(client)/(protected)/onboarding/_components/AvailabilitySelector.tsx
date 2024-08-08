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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  styled,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  dayjsToMinutes,
  minutesToDayjs,
  minutesToTime,
} from '@/utils/timeConversions';
import {
  dayOrder,
  week,
  type Availability,
  type AvailabilitySlot,
  type Day,
  type TimeFormat,
} from '@/types';

//TODO - lots of work on styling required here - beware of changing layout affecting the
// function of the switch and delete buttons - strange interplay happening.
// also need to modify theme style of paper in order to not mess up the timepicker styling.

interface AvailabilitySelectorProps {
  availability: Availability | null;
  timeFormatPreference: TimeFormat | null;
  onAvailabilityChange: (newAvailability: Availability) => void;
  onTimeFormatPreferenceChange: (newPreference: TimeFormat) => void;
}

const specialOptions = ['Everyday', 'All Weekdays', 'Weekends'] as const;
type SpecialOption = (typeof specialOptions)[number];
type DayOption = Day | SpecialOption;

const allOptions: DayOption[] = [...specialOptions, ...week];

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  availability,
  timeFormatPreference,
  onAvailabilityChange,
  onTimeFormatPreferenceChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<{
    dayOption: DayOption;
    startTime: number;
    endTime: number;
  }>({
    dayOption: 'Everyday',
    startTime: 9 * 60,
    endTime: 17 * 60,
  });
  const [error, setError] = useState<string | null>(null);

  // Use a default value if availability is null
  const safeAvailability = availability || [];

  // Use a default value if timeFormatPreference is null
  const safeTimeFormatPreference = timeFormatPreference || '24';

  const isSpecialOption = (day: DayOption): day is SpecialOption => {
    return specialOptions.includes(day as SpecialOption);
  };

  const getDaysForOption = (option: SpecialOption): Day[] => {
    switch (option) {
      case 'Everyday':
        return week;
      case 'All Weekdays':
        return week.slice(0, 5);
      case 'Weekends':
        return week.slice(5);
    }
  };

  const mergeOverlappingSlots = (
    existingSlots: AvailabilitySlot[],
    newSlots: Omit<AvailabilitySlot, 'id'>[]
  ): AvailabilitySlot[] => {
    let allSlots = [
      ...existingSlots,
      ...newSlots.map((slot) => ({
        ...slot,
        id: Math.random().toString(36).substr(2, 9),
      })),
    ];

    let mergedSlots: AvailabilitySlot[] = [];
    let hasChanges: boolean;

    do {
      hasChanges = false;
      mergedSlots = [];

      for (const day of Object.keys(dayOrder) as Day[]) {
        const daySlots = allSlots
          .filter((slot) => slot.day === day)
          .sort((a, b) => a.startTime - b.startTime);

        let currentSlot: AvailabilitySlot | null = null;

        for (const slot of daySlots) {
          if (!currentSlot) {
            currentSlot = { ...slot };
          } else if (slot.startTime <= currentSlot.endTime) {
            currentSlot.endTime = Math.max(currentSlot.endTime, slot.endTime);
            hasChanges = true;
          } else {
            mergedSlots.push(currentSlot);
            currentSlot = { ...slot };
          }
        }

        if (currentSlot) {
          mergedSlots.push(currentSlot);
        }
      }

      allSlots = mergedSlots;
    } while (hasChanges);

    return sortAvailabilitySlots(mergedSlots);
  };

  const sortAvailabilitySlots = (
    slots: AvailabilitySlot[]
  ): AvailabilitySlot[] => {
    return slots.sort((a, b) => {
      if (a.day !== b.day) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.startTime - b.startTime;
    });
  };

  const validateTime = (
    startTime: number | null,
    endTime: number | null
  ): boolean => {
    // Check if times are numeric
    if (
      typeof startTime !== 'number' ||
      typeof endTime !== 'number' ||
      isNaN(startTime) ||
      isNaN(endTime)
    ) {
      setError('Invalid time values. Please enter valid times.');
      return false;
    }

    // Check if start time is before end time
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }

    // Check if the time slot is within 24 hours
    if (endTime - startTime > 24 * 60) {
      setError('Time slot cannot exceed 24 hours');
      return false;
    }

    // Check if times are in 5-minute increments
    if (startTime % 5 !== 0 || endTime % 5 !== 0) {
      setError('Times must be in 5-minute increments');
      return false;
    }

    setError(null);
    return true;
  };

  const handleAdd = () => {
    if (!validateTime(newSlot.startTime, newSlot.endTime)) {
      return;
    }

    let slotsToAdd: Omit<AvailabilitySlot, 'id'>[] = [];

    if (isSpecialOption(newSlot.dayOption)) {
      slotsToAdd = getDaysForOption(newSlot.dayOption).map((day) => ({
        day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      }));
    } else {
      slotsToAdd = [
        {
          day: newSlot.dayOption,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        },
      ];
    }

    const newAvailability = mergeOverlappingSlots(safeAvailability, slotsToAdd);

    onAvailabilityChange(newAvailability);
    setIsDialogOpen(false);
    setNewSlot({ dayOption: 'Monday', startTime: 9 * 60, endTime: 17 * 60 });
    setError(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setError(null);
  };

  const handleTimeFormatChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFormat: TimeFormat = event.target.checked ? '12' : '24';
    onTimeFormatPreferenceChange(newFormat);
  };

  const formatTime = (minutes: number) => {
    return minutesToTime(minutes, safeTimeFormatPreference === '12');
  };

  const groupSlotsByDay = (
    slots: AvailabilitySlot[]
  ): Record<Day, AvailabilitySlot[]> => {
    const grouped: Record<Day, AvailabilitySlot[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    slots.forEach((slot) => {
      grouped[slot.day].push(slot);
    });

    return grouped;
  };

  const handleDelete = (slotToDelete: AvailabilitySlot) => {
    const newAvailability = safeAvailability.filter(
      (slot) => slot.id !== slotToDelete.id
    );
    onAvailabilityChange(sortAvailabilitySlots(newAvailability));
  };

  const handleTimeChange = (type: 'start' | 'end', newValue: any) => {
    const minutes = dayjsToMinutes(newValue);
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      setError(`Invalid ${type} time. Please enter a valid time.`);
      return;
    }
    setNewSlot({
      ...newSlot,
      [type === 'start' ? 'startTime' : 'endTime']: minutes,
    });
    setError(null);
  };

  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    '& .MuiInputLabel-root': {
      backgroundColor: theme.palette.background.paper,
      padding: '0 4px',
    },
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControlLabel
        control={
          <Switch
            checked={safeTimeFormatPreference === '12'}
            onChange={handleTimeFormatChange}
            name='timeFormat'
          />
        }
        label={safeTimeFormatPreference === '12' ? '12-hour' : '24-hour'}
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      />
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
          {Object.entries(
            groupSlotsByDay(sortAvailabilitySlots(safeAvailability))
          ).map(([day, slots]) => (
            <ListItem key={day} sx={{ py: 1, px: 0 }}>
              <Grid container spacing={2} alignItems='flex-start' wrap='nowrap'>
                <Grid item xs={3}>
                  <Typography
                    variant='subtitle1'
                    sx={{ fontWeight: 'bold', lineHeight: 1.75 }}
                  >
                    {day}
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  {slots.length > 0 ? (
                    slots.map((slot, index) => (
                      <Box
                        key={slot.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: index !== slots.length - 1 ? 1 : 0,
                        }}
                      >
                        <Typography sx={{ lineHeight: 1.75 }}>
                          {formatTime(slot.startTime)} -{' '}
                          {formatTime(slot.endTime)}
                        </Typography>
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={() => handleDelete(slot)}
                          size='small'
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      sx={{ color: 'text.secondary', lineHeight: 1.75 }}
                    >
                      ---------------------
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2 }}>
        <Fab
          color='primary'
          aria-label='add'
          onClick={() => setIsDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Box>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New Time Slot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StyledFormControl fullWidth margin='normal'>
                <InputLabel id='day-select-label'>Day</InputLabel>
                <Select
                  labelId='day-select-label'
                  value={newSlot.dayOption}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      dayOption: e.target.value as DayOption,
                    })
                  }
                  fullWidth
                >
                  {allOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>
            <Grid item xs={6}>
              <DesktopTimePicker
                //TODO - decide on type of time picker
                label='Start Time'
                value={minutesToDayjs(newSlot.startTime)}
                onChange={(newValue) => handleTimeChange('start', newValue)}
                minutesStep={5}
                ampm={safeTimeFormatPreference === '12'}
              />
            </Grid>
            <Grid item xs={6}>
              <TimePicker
                label='End Time'
                value={minutesToDayjs(newSlot.endTime)}
                onChange={(newValue) => handleTimeChange('end', newValue)}
                minutesStep={5}
                ampm={safeTimeFormatPreference === '12'}
              />
            </Grid>
          </Grid>
          {error && (
            <Typography
              color='error'
              variant='body2'
              style={{ marginTop: '1rem' }}
            >
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color='secondary'
            disabled={!!error}
            sx={{ marginRight: 'auto', minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            color='primary'
            disabled={!!error}
            sx={{ minWidth: 120 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AvailabilitySelector;
