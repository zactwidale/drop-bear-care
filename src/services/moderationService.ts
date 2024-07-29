export interface ModerationResult {
  isApproved: boolean;
  reason?: string;
  details?: {
    adult?: string;
    spoof?: string;
    medical?: string;
    violence?: string;
    racy?: string;
    error?: string;
  };
}

export async function moderateContent(
  content: string
): Promise<ModerationResult> {
  try {
    const response = await fetch('/api/moderate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Moderation request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error during content moderation:', error);
    throw new Error('Content moderation failed');
  }
}

export async function moderateImage(file: File): Promise<ModerationResult> {
  const formData = new FormData();
  formData.append('image', file, file.name);

  try {
    const response = await fetch('/api/moderate-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ModerationResult = await response.json();
    return result;
  } catch (error) {
    console.error('Error in image moderation:', error);
    return {
      isApproved: false,
      reason: 'Error during moderation process',
      details: { error: String(error) },
    };
  }
}
