/**
 * Handler for RANDOM command
 */
import { InteractionResponseType } from 'discord-interactions';
import { generateRandomIntegers } from '../api/randomApi.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleRandomCommand(interaction, env) {
  try {
    const options = interaction.data.options || [];
    const minOption = options.find((option) => option.name === 'min');
    const maxOption = options.find((option) => option.name === 'max');
    const countOption = options.find((option) => option.name === 'count');

    const min = minOption ? minOption.value : 1;
    const max = maxOption ? maxOption.value : 100;
    const count = countOption ? Math.min(countOption.value, 10) : 1;

    if (min > max) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Giá trị nhỏ nhất không được lớn hơn giá trị lớn nhất!',
        },
      });
    }

    const results = [];
    for (let i = 0; i < count; i++) {
      const randomNumber = await generateRandomIntegers(
        env.RANDOM_ORG_API_KEY,
        count,
        min,
        max,
      );
      results.push(randomNumber);
    }

    const resultText =
      count === 1
        ? `🎲 Random number: **${results[0]}**`
        : `🎲 Random numbers: **${results.join(', ')}**`;

    const rangeText = `(${min}-${max})`;
    const sourceText = '\n*Random vô cùng uy tín*';

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${resultText} ${rangeText}${sourceText}`,
      },
    });
  } catch (error) {
    console.error('Error generating random number:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Failed to generate random number. Vui lòng thử lại sau.',
      },
    });
  }
}
