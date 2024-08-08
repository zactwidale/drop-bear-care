import type { Timestamp } from 'firebase/firestore';
import type { Availability } from './availability';
import type { Languages } from './languages';

export interface SearchResult {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  membershipType: string;
  distance: number;
  availability: Availability | null;
  lastActive: Timestamp | null;
  languages: Languages | null;
}
