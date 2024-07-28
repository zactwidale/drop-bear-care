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
