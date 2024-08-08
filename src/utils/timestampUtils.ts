import { Timestamp } from 'firebase/firestore';

export function isTimestampLike(
  obj: any
): obj is { seconds: number; nanoseconds: number } {
  return (
    obj && typeof obj === 'object' && 'seconds' in obj && 'nanoseconds' in obj
  );
}

export function reconstructTimestamp(obj: any): Timestamp | null {
  if (obj instanceof Timestamp) return obj;
  if (isTimestampLike(obj)) {
    return new Timestamp(obj.seconds, obj.nanoseconds);
  }
  return null;
}

export function ensureTimestamp(value: any): Timestamp | null {
  if (value instanceof Timestamp) return value;
  if (isTimestampLike(value)) {
    return new Timestamp(value.seconds, value.nanoseconds);
  }
  return null;
}

export const lastActiveText = (lastActive: Timestamp | null): string => {
  if (!lastActive) {
    return 'unknown';
  }

  const now = Timestamp.now();
  const diffInSeconds = now.seconds - lastActive.seconds;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 5) {
    return 'within the last 5 minutes';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  } else {
    return 'more than a year ago';
  }
};
