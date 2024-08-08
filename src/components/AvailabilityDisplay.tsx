import React from 'react';
import { Box, List, ListItem, Grid, Typography, Divider } from '@mui/material';
import {
  dayOrder,
  week,
  type Availability,
  type AvailabilitySlot,
  type Day,
  type TimeFormat,
} from '@/types';
import { minutesToTime } from '@/utils/timeConversions';

interface AvailabilityDisplayProps {
  availability: Availability;
  currentUserAvailability: Availability;
  timeFormatPreference: TimeFormat;
}

const AvailabilityDisplay: React.FC<AvailabilityDisplayProps> = ({
  availability,
  currentUserAvailability,
  timeFormatPreference,
}) => {
  const formatTime = (minutes: number) => {
    return minutesToTime(minutes, timeFormatPreference === '12');
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

  const calculateOverlap = (
    slot1: AvailabilitySlot,
    slot2: AvailabilitySlot
  ): number => {
    const start = Math.max(slot1.startTime, slot2.startTime);
    const end = Math.min(slot1.endTime, slot2.endTime);
    return Math.max(0, (end - start) / 60); // Convert minutes to hours
  };

  const calculateSlotOverlap = (
    slot: AvailabilitySlot,
    currentUserSlots: AvailabilitySlot[]
  ): number => {
    let totalOverlap = 0;
    for (const currentUserSlot of currentUserSlots) {
      totalOverlap += calculateOverlap(slot, currentUserSlot);
    }
    return totalOverlap;
  };

  const groupedAvailability = groupSlotsByDay(
    sortAvailabilitySlots(availability)
  );

  const groupedCurrentUserAvailability = groupSlotsByDay(
    sortAvailabilitySlots(currentUserAvailability)
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <List sx={{ width: '100%', maxWidth: 600 }}>
        {week.map((day) => (
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
                {groupedAvailability[day].length > 0 ? (
                  groupedAvailability[day].map((slot, index, array) => {
                    const slotOverlap = calculateSlotOverlap(
                      slot,
                      groupedCurrentUserAvailability[day]
                    );

                    return (
                      <React.Fragment key={slot.id}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography sx={{ lineHeight: 1.75 }}>
                            {formatTime(slot.startTime)} -{' '}
                            {formatTime(slot.endTime)}
                          </Typography>
                          {slotOverlap > 0 && (
                            <Typography sx={{ ml: 2, color: 'success.main' }}>
                              {slotOverlap.toFixed(1)} hrs in common
                            </Typography>
                          )}
                        </Box>
                        {index < array.length - 1 && <Divider sx={{ my: 1 }} />}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <Typography
                    sx={{ color: 'text.secondary', lineHeight: 1.75 }}
                  >
                    Not available
                  </Typography>
                )}
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AvailabilityDisplay;
