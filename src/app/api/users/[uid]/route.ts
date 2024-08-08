import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const uid = params.uid;

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
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
  const uid = params.uid;
  const body = await request.json();

  if (!body.hiddenProfiles) {
    return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { hiddenProfiles: body.hiddenProfiles });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    );
  }
}
