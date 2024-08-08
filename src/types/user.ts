import { Timestamp } from 'firebase/firestore';
import { OnboardingStage } from './onboarding';
import type { Availability, TimeFormat } from './availability';
import type { Languages } from './languages';
import type { SuburbFirestore } from './location';

export type Gender = 'male' | 'female' | 'other' | 'prefer not to say';

export interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string;
  lastActive: Timestamp;
  createdAt: Timestamp;
  onboardingStage: OnboardingStage;
  membershipType?: 'provider' | 'seeker';
  preferredName?: string;
  dateOfBirth?: Timestamp;
  age?: string;
  hideAge?: boolean;
  gender?: Gender;
  bio?: string;
  photoURLs?: string[];
  location?: SuburbFirestore;
  timeFormatPreference?: TimeFormat;
  availability?: Availability;
  languages?: Languages;
  hiddenProfiles?: string[];
}
