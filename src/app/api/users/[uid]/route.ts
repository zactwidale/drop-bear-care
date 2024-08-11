import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { GeoPoint } from 'firebase-admin/firestore';

async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const authenticatedUid = await verifyAuth(request);
  if (!authenticatedUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = params.uid;

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // Convert GeoPoint to a plain object
    if (userData?.location?.geopoint instanceof GeoPoint) {
      userData.location.geopoint = {
        latitude: userData.location.geopoint.latitude,
        longitude: userData.location.geopoint.longitude,
      };
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const authenticatedUid = await verifyAuth(request);
  if (!authenticatedUid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = params.uid;

  // Ensure the authenticated user is only updating their own data
  if (authenticatedUid !== uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  if (!body.hiddenProfiles) {
    return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
  }

  try {
    await adminDb
      .collection('users')
      .doc(uid)
      .update({ hiddenProfiles: body.hiddenProfiles });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    );
  }
}
