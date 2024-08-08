import { NextRequest, NextResponse } from 'next/server';
import { searchUsersWithinRadius } from '@/utils/userSearch';
import { SuburbFirestore } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { currentUserLocation, radiusKm, currentUserId } = body;

  if (!currentUserLocation || !radiusKm || !currentUserId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const results = await searchUsersWithinRadius(
      currentUserLocation as SuburbFirestore,
      radiusKm as number,
      currentUserId as string
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
