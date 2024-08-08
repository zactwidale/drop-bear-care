export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const week: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const dayOrder: { [key in Day]: number } = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export interface AvailabilitySlot {
  id: string;
  day: Day;
  startTime: number; // minutes since midnight
  endTime: number; // minutes since midnight
}

export type Availability = AvailabilitySlot[];

export type TimeFormat = '12' | '24';
