/**
 * Handler for mang command
 */
import { InteractionResponseType } from 'discord-interactions';
import { JsonResponse } from '../utils/JsonResponse.js';
import { generateAIResponse } from '../api/geminiApi.js';

export async function handleMangCommand(interaction, env) {
  const targetUserId = interaction.data?.options?.[0]?.value;

  if (!targetUserId) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'ĐM dũng' },
    });
  } else {
    // const response = await generateAIResponse(
    //   env.GEMINI_API_KEY,
    //   'hello how are you',
    // );

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `ĐM <@${targetUserId}>` },
    });
  }
}
