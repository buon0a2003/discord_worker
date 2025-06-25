/**
 * Handler for TET command
 */
import { InteractionResponseType } from 'discord-interactions';
import {
  updateChannelName,
  getDaysUntilLunarNewYear,
} from '../services/lunarNewYear.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleTetCommand(interaction, env) {
  const remainingDays = getDaysUntilLunarNewYear();

  await updateChannelName(env.DISCORD_TOKEN, env.VOICE_CHANNEL_ID);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Đã update lại: Còn ${remainingDays} ngày nữa!`,
    },
  });
}
