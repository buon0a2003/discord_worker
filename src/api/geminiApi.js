/**
 * Generate AI response using Gemini REST API
 * @param {string} apiKey - Google Gemini API key
 * @param {string} question - User question/prompt
 * @param {Object} options - Generation options
 * @param {string} options.model - Model to use (default: 'gemini-1.5-flash')
 * @param {number} options.temperature - Creativity level (0-2, default: 0.7)
 * @param {number} options.maxOutputTokens - Maximum tokens to generate (default: 1000)
 * @returns {Promise<string|null>} Generated text or null if error
 */
export async function generateAIResponse(apiKey, question, options = {}) {
  if (!apiKey) {
    console.error('Gemini API key is required');
    return null;
  }

  if (!question || question.trim().length === 0) {
    console.error('Question/prompt is required');
    return null;
  }

  const model = options.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: question,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);

      // Handle specific error types
      if (data.error?.code === 400) {
        console.error('Bad request - check your prompt or parameters');
      } else if (data.error?.code === 403) {
        console.error('API key invalid or quota exceeded');
      } else if (data.error?.code === 429) {
        console.error('Rate limit exceeded');
      }

      return null;
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response generated');
      return null;
    }

    const candidate = data.candidates[0];

    // // Check if content was blocked by safety filters
    // if (candidate.finishReason === 'SAFETY') {
    //   console.error('Content blocked by safety filters');
    //   return null;
    // }

    const text = candidate.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text content in response');
      return null;
    }

    console.log('Gemini AI response generated successfully:');
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

export default {
  generateAIResponse,
};
