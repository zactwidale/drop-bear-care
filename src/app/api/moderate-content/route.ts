import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function extractJsonFromString(str: string): any {
  const jsonMatch = str.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
    }
  }
  return null;
}

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Please analyze the following content for:
    1. Any inappropriate, offensive, or sensitive material
    2. Any contact information (e.g., phone numbers, email addresses, social media handles, physical addresses)
    
    Content to analyze:
    "${content}"
    
    Respond with a JSON object containing these fields:
    1. "isApproved": A boolean indicating whether the content is appropriate and doesn't contain contact info (true) or not (false).
    2. "reason": If the content is not approved, provide the reason as either "inappropriate" for inappropriate content or "contactInfo" if contact information was found. If approved, this should be null.

    Wrap your JSON response in markdown code blocks, like this:
    \`\`\`json
    {
      "isApproved": true,
      "reason": null
    }
    \`\`\`

    Or for not approved content:
    \`\`\`json
    {
      "isApproved": false,
      "reason": "inappropriate"
    }
    \`\`\`

    Or if contact info is found:
    \`\`\`json
    {
      "isApproved": false,
      "reason": "contactInfo"
    }
    \`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonResult = extractJsonFromString(response.text());

    if (!jsonResult) {
      throw new Error('Failed to parse AI response');
    }

    return NextResponse.json({
      isApproved: jsonResult.isApproved,
      reason: jsonResult.reason || undefined,
    });
  } catch (error: any) {
    console.error('Error during content moderation:', error);

    if (
      error.message &&
      error.message.includes('Candidate was blocked due to SAFETY')
    ) {
      return NextResponse.json({
        isApproved: false,
        reason: 'inappropriate',
      });
    }

    return NextResponse.json({
      isApproved: false,
      reason: 'inappropriate', // Using "inappropriate" as a catch-all for unexpected errors
    });
  }
}
