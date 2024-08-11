import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { searchUsersWithinRadius } from '@/utils/userSearch';

//*****************************************************************
// IMPORTANT: When using this API, GepPoints and Timestamps must be
// reconstructed on the client side.
//*****************************************************************

export async function POST(request: NextRequest) {
  // Get the ID token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { currentUserLocation, radiusKm } = body;

    if (!currentUserLocation || !radiusKm) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const results = await searchUsersWithinRadius(
      adminDb,
      currentUserLocation,
      radiusKm,
      uid
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for users' },
      { status: 500 }
    );
  }
}
