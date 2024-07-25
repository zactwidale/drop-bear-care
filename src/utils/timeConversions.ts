import dayjs from 'dayjs';

export const minutesToTime = (
  minutes: number,
  use12HourFormat: boolean = false
): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (use12HourFormat) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }
};

export const minutesToDayjs = (minutes: number) => {
  return dayjs().startOf('day').add(minutes, 'minute');
};

export const dayjsToMinutes = (time: dayjs.Dayjs | null) => {
  if (!time) return 0;
  return time.hour() * 60 + time.minute();
};
