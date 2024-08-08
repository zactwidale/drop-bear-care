import { GeoPoint } from 'firebase-admin/firestore';
import { SuburbFirestore, UserData, SearchResult } from '@/types';
import {
  collection,
  getDocs,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ensureTimestamp } from './timestampUtils';

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export async function searchUsersWithinRadius(
  currentUserLocation: SuburbFirestore,
  radiusKm: number,
  currentUserId: string
): Promise<SearchResult[]> {
  const { latitude, longitude } = currentUserLocation.geopoint;

  const usersRef = collection(db, 'users');

  try {
    const querySnapshot = await getDocs(usersRef);
    const results: SearchResult[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const userData = doc.data() as UserData;

      if (userData.uid === currentUserId) {
        return;
      }

      if (userData.location && userData.location.geopoint) {
        const userLocation = userData.location.geopoint;
        const distance = calculateDistance(
          latitude,
          longitude,
          userLocation.latitude,
          userLocation.longitude
        );

        if (distance <= radiusKm) {
          results.push({
            uid: userData.uid,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            membershipType: userData.membershipType!,
            distance,
            languages: userData.languages!,
            availability: userData.availability!,
            lastActive: ensureTimestamp(userData.lastActive!),
          });
        }
      }
    });

    return results.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
