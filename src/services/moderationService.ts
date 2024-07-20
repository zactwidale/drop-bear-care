export interface ModerationResult {
  isApproved: boolean;
  reason?: 'inappropriate' | 'contactInfo';
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
