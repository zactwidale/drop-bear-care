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

  if (typeof obj === 'object' && obj !== null) {
    // // Check for seconds and nanoseconds
    // if ('seconds' in obj && 'nanoseconds' in obj) {
    //   return new Timestamp(obj.seconds, obj.nanoseconds);
    // }

    // Check for _seconds and _nanoseconds (some serialization formats use these)
    if ('_seconds' in obj && '_nanoseconds' in obj) {
      return new Timestamp(obj._seconds, obj._nanoseconds);
    }

    // // Check for a 'toDate' function (Firestore sometimes serializes to this format)
    // if (typeof obj.toDate === 'function') {
    //   return Timestamp.fromDate(obj.toDate());
    // }
  }

  // // Check if it's a number (Unix timestamp in seconds or milliseconds)
  // if (typeof obj === 'number') {
  //   return Timestamp.fromMillis(obj * (obj > 100000000000 ? 1 : 1000));
  // }

  // // Check if it's an ISO date string
  // if (typeof obj === 'string') {
  //   const date = new Date(obj);
  //   if (!isNaN(date.getTime())) {
  //     return Timestamp.fromDate(date);
  //   }
  // }

  console.error('Unable to reconstruct Timestamp from:', obj);
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
