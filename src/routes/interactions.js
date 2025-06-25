/**
 * Route handler for Discord interactions
 */
import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { TET, RANDOM, GACHA, GACHA_LIST, MANG } from '../config/commands.js';
import {
  handleTetCommand,
  handleRandomCommand,
  handleGachaCommand,
  handleGachaListCommand,
  handleMangCommand,
} from '../handlers/index.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleInteraction(interaction, env) {
  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data.name.toLowerCase();

    switch (commandName) {
      case TET.name.toLowerCase():
        return await handleTetCommand(interaction, env);

      case RANDOM.name.toLowerCase():
        return await handleRandomCommand(interaction, env);

      case GACHA.name.toLowerCase():
        return await handleGachaCommand(interaction, env);

      case GACHA_LIST.name.toLowerCase():
        return await handleGachaListCommand(interaction, env);

      case MANG.name.toLowerCase():
        return await handleMangCommand(interaction, env);

      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
}
