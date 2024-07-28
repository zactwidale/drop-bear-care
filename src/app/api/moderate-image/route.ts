import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { ModerationResult } from '@/services/moderationService';

const { Likelihood } = protos.google.cloud.vision.v1;

function likelihoodToString(
  likelihood: keyof typeof Likelihood | null | undefined
): string {
  if (likelihood === null || likelihood === undefined) return 'UNKNOWN';
  return likelihood;
}

function isPossiblyInappropriate(likelihood: string): boolean {
  return ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'].includes(likelihood);
}

function parseCredentials(credentialsString: string): object | null {
  try {
    // First, try parsing the string directly
    return JSON.parse(credentialsString);
  } catch (error) {
    console.error('Failed to parse credentials directly:', error);
    try {
      // If direct parsing fails, try parsing it as a string literal
      return JSON.parse(JSON.parse(credentialsString));
    } catch (innerError) {
      console.error(
        'Failed to parse credentials as string literal:',
        innerError
      );
      return null;
    }
  }
}

export async function POST(request: NextRequest) {
  const credentialsString = process.env.GOOGLE_VISION_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;

  if (!credentialsString || !projectId) {
    console.error('Missing Google Cloud credentials or project ID');
    return NextResponse.json(
      {
        isApproved: false,
        reason: 'Server configuration error',
        details: { error: 'Missing Google Cloud configuration' },
      } as ModerationResult,
      { status: 500 }
    );
  }

  const credentials = parseCredentials(credentialsString);

  if (!credentials) {
    console.error('Failed to parse Google Cloud credentials');
    return NextResponse.json(
      {
        isApproved: false,
        reason: 'Server configuration error',
        details: { error: 'Invalid Google Cloud credentials' },
      } as ModerationResult,
      { status: 500 }
    );
  }

  let client: ImageAnnotatorClient;
  try {
    client = new ImageAnnotatorClient({
      credentials: credentials,
      projectId: projectId,
    });
  } catch (error) {
    console.error('Error initializing ImageAnnotatorClient:', error);
    return NextResponse.json(
      {
        isApproved: false,
        reason: 'Server configuration error',
        details: { error: 'Failed to initialize Vision API client' },
      } as ModerationResult,
      { status: 500 }
    );
  }
  const formData = await request.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    console.error('No image file provided in the request');
    return NextResponse.json(
      {
        isApproved: false,
        reason: 'No image file provided',
        details: { error: 'No image file provided' },
      } as ModerationResult,
      { status: 400 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const [result] = await client.safeSearchDetection(buffer);
    const detections = result.safeSearchAnnotation;

    if (!detections) {
      return NextResponse.json({
        isApproved: true,
        reason: 'No issues detected',
      } as ModerationResult);
    }

    const moderationResult: ModerationResult = {
      isApproved: true,
      reason: 'Content approved',
      details: {
        adult: likelihoodToString(detections.adult as keyof typeof Likelihood),
        spoof: likelihoodToString(detections.spoof as keyof typeof Likelihood),
        medical: likelihoodToString(
          detections.medical as keyof typeof Likelihood
        ),
        violence: likelihoodToString(
          detections.violence as keyof typeof Likelihood
        ),
        racy: likelihoodToString(detections.racy as keyof typeof Likelihood),
      },
    };

    if (
      isPossiblyInappropriate(moderationResult.details!.adult || '') ||
      isPossiblyInappropriate(moderationResult.details!.violence || '') ||
      isPossiblyInappropriate(moderationResult.details!.racy || '')
    ) {
      moderationResult.isApproved = false;
      moderationResult.reason = 'inappropriate';
    }

    return NextResponse.json(moderationResult);
  } catch (error) {
    console.error('Error in image moderation:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        isApproved: false,
        reason: 'Error during image moderation',
        details: { error: String(error) },
      } as ModerationResult,
      { status: 500 }
    );
  }
}
