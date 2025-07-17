/**
 * Route handler for Discord interactions
 */
import { InteractionResponseType, InteractionType } from 'discord-interactions';
import {
  TET,
  RANDOM,
  GACHA,
  GACHA_LIST,
  MANG,
  ASK_GEMINI,
  BLACKLIST,
  YT,
  ADDSONG,
  PLAYSONG,
} from '../config/commands.js';
import {
  handleTetCommand,
  handleRandomCommand,
  handleGachaCommand,
  handleGachaListCommand,
  handleMangCommand,
  handleAskGeminiCommand,
  handleBlackListCommand,
  handleYtCommand,
  handleAddSongCommand,
  handlePlaySongCommand,
} from '../handlers/index.js';
import { JsonResponse } from '../utils/JsonResponse.js';
import { isUserBlacklisted } from '../services/blacklist.js';

export async function handleInteraction(interaction, env) {
  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data.name.toLowerCase();
    const sender = interaction.member?.user || interaction.user;

    // Check blacklist using the service
    if (sender?.id && (await isUserBlacklisted(env.DB, sender.id))) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `<@${sender.id}> cook 😠` },
      });
    }

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

      case ASK_GEMINI.name.toLowerCase():
        return await handleAskGeminiCommand(interaction, env);

      case BLACKLIST.name.toLowerCase():
        if (sender?.id == '687520598980689956') {
          return await handleBlackListCommand(interaction, env);
        } else {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Bạn không có quyền sử dụng lệnh này' },
          });
        }

      case YT.name.toLowerCase():
        return await handleYtCommand(interaction, env);
      case ADDSONG.name.toLowerCase():
        return await handleAddSongCommand(interaction, env);
      case PLAYSONG.name.toLowerCase():
        return await handlePlaySongCommand(interaction, env);

      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
}
