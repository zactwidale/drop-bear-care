import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { adminDb, admin } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { to, subject, emailType, userId } = await request.json();

    if (!to || !subject || !emailType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let emailContent;
    let token;

    switch (emailType) {
      case 'accountDeletion':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Missing userId for account deletion' },
            { status: 400 }
          );
        }
        token = await generateAndStoreToken(to, userId);
        emailContent = generateAccountDeletionEmail(token);
        break;
      // Add other email types here
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        ...emailContent,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in send-email API route:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

async function generateAndStoreToken(
  email: string,
  userId: string
): Promise<string> {
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  const deletionRequest = {
    token,
    email,
    userId,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    used: false,
  };

  try {
    console.log('Attempting to store token in Firestore:', token);
    await adminDb
      .collection('accountDeletionRequests')
      .doc(token)
      .set(deletionRequest);
    console.log('Token stored successfully');
    return token;
  } catch (error) {
    console.error('Firestore error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save deletion request: ${error.message}`);
    } else {
      throw new Error('Failed to save deletion request: Unknown error');
    }
  }
}

function generateAccountDeletionEmail(token: string) {
  const deletionLink = `${process.env.NEXT_PUBLIC_APP_URL}/delete-account?token=${token}`;

  const text = `
    You have requested to delete your account. To proceed with the account deletion, please click on the following link:
    
    ${deletionLink}
    
    If you did not request to delete your account, please ignore this email.
    
    This link will expire in 1 hour for security reasons.
  `;

  const html = `
    <p>You have requested to delete your account. To proceed with the account deletion, please click on the following link:</p>
    <p><a href="${deletionLink}">${deletionLink}</a></p>
    <p>If you did not request to delete your account, please ignore this email.</p>
    <p>This link will expire in 1 hour for security reasons.</p>
  `;

  return { text, html };
}
