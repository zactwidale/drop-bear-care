import { GeoPoint } from 'firebase/firestore';

export interface SuburbJSON {
  id: string;
  suburb: string;
  state: string;
  postcode: string;
  geopoint: {
    latitude: number;
    longitude: number;
  };
}

export interface SuburbFirestore {
  id: string;
  suburb: string;
  state: string;
  postcode: string;
  geopoint: GeoPoint;
  geohash4: string;
  geohash5: string;
  geohash6: string;
  geohash7: string;
}

// Simple geohash implementation
function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number
): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90,
    latMax = 90;
  let lonMin = -180,
    lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude > lonMid) {
        idx = idx * 2 + 1;
        lonMin = lonMid;
      } else {
        idx *= 2;
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (latitude > latMid) {
        idx = idx * 2 + 1;
        latMin = latMid;
      } else {
        idx *= 2;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += base32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

// Helper function to generate geohashes for a given latitude and longitude
function generateGeohashes(
  latitude: number,
  longitude: number
): {
  geohash4: string;
  geohash5: string;
  geohash6: string;
  geohash7: string;
} {
  const fullGeohash = encodeGeohash(latitude, longitude, 7);
  return {
    geohash4: fullGeohash.substring(0, 4),
    geohash5: fullGeohash.substring(0, 5),
    geohash6: fullGeohash.substring(0, 6),
    geohash7: fullGeohash,
  };
}

// Convert from JSON format to Firestore format
export function jsonToFirestore(suburbJSON: SuburbJSON): SuburbFirestore {
  const { latitude, longitude } = suburbJSON.geopoint;
  const geohashes = generateGeohashes(latitude, longitude);

  return {
    ...suburbJSON,
    geopoint: new GeoPoint(latitude, longitude),
    ...geohashes,
  };
}

// Convert from Firestore format to JSON format
export function firestoreToJSON(
  suburbFirestore: SuburbFirestore | undefined
): SuburbJSON | null {
  if (!suburbFirestore) {
    return null;
  }

  const { id, suburb, state, postcode, geopoint } = suburbFirestore;
  return {
    id,
    suburb,
    state,
    postcode,
    geopoint: {
      latitude: geopoint.latitude,
      longitude: geopoint.longitude,
    },
  };
}
