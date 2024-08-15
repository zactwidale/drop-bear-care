import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenDoc = await adminDb
      .collection('accountDeletionRequests')
      .doc(token)
      .get();
    if (!tokenDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    const tokenData = tokenDoc.data();
    if (
      !tokenData ||
      tokenData.used ||
      tokenData.expiresAt.toDate() < new Date()
    ) {
      return NextResponse.json(
        { success: false, error: 'Token is expired or already used' },
        { status: 400 }
      );
    }

    // Mark the token as used
    await adminDb
      .collection('accountDeletionRequests')
      .doc(token)
      .update({ used: true });

    await admin.auth().deleteUser(tokenData.userId);
    await deleteUserData(tokenData.userId);
    console.log(`Deleting user photos: ${tokenData.userId}`);
    await deleteUserPhotos(tokenData.userId);
    console.log(`Deleted user photos: ${tokenData.userId}`);
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

async function deleteUserData(userId: string) {
  await adminDb.collection('users').doc(userId).delete();
}

async function deleteUserPhotos(userId: string) {
  try {
    console.log('Attempting to delete photos for user:', userId);

    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );
    const bucket = admin
      .storage()
      .bucket(`${serviceAccount.project_id}.appspot.com`);

    console.log('Storage bucket:', bucket.name);

    const [files] = await bucket.getFiles({ prefix: `user-photos/${userId}/` });

    console.log(`Found ${files.length} files to delete for user ${userId}`);

    for (const file of files) {
      await file.delete();
      console.log(`Deleted file: ${file.name}`);
    }

    console.log(`Deleted photos for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting photos for user ${userId}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error; // Re-throw the error to be caught in the main try-catch block
  }
}
