import { generateAIResponse } from '../api/geminiApi.js';
import { JsonResponse } from '../utils/JsonResponse.js';
import { InteractionResponseType } from 'discord-interactions';

export async function handleAskGeminiCommand(interaction, env) {
  const question = interaction.data.options[0].value;
  const response = await generateAIResponse(env.GEMINI_API_KEY, question);
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: response },
  });
}
