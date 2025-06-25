/**
 * Handler for GACHA command
 */
import { InteractionResponseType } from 'discord-interactions';
import { getRandomGachaItem } from '../services/gachaList.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleGachaCommand(interaction, env) {
  try {
    const options = interaction.data.options || [];
    const listOption = options.find((option) => option.name === 'list');
    const listName = listOption ? listOption.value : null;

    const gachaItem = await getRandomGachaItem(
      env.RANDOM_ORG_API_KEY,
      listName,
    );
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: gachaItem },
    });
  } catch (error) {
    console.error('Error in gacha command:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Failed to get gacha item. Vui lòng thử lại sau.',
      },
    });
  }
}
