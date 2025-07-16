/**
 * Handler for blacklist command
 */
import { InteractionResponseType } from 'discord-interactions';
import {
  getBlacklistDisplay,
  addUserToBlacklist,
  removeUserFromBlacklist,
  isUserBlacklisted,
} from '../services/blacklist.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleBlackListCommand(interaction, env) {
  try {
    const subcommand = interaction.data.options?.[0];
    if (!subcommand) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Vui lòng chỉ định một subcommand (show, add, remove)',
        },
      });
    }

    const subcommandOptions = subcommand.options || [];

    switch (subcommand.name) {
      case 'show': {
        const blacklistDisplay = await getBlacklistDisplay(env.DB);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: blacklistDisplay },
        });
      }

      case 'add': {
        const memberOption = subcommandOptions.find(
          (opt) => opt.name === 'member',
        );

        if (!memberOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Member là bắt buộc để thêm vào blacklist',
            },
          });
        }

        const userId = memberOption.value;
        const result = await addUserToBlacklist(env.DB, userId);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      case 'remove': {
        const memberOption = subcommandOptions.find(
          (opt) => opt.name === 'member',
        );

        if (!memberOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Member là bắt buộc để xóa khỏi blacklist',
            },
          });
        }

        const userId = memberOption.value;
        const result = await removeUserFromBlacklist(env.DB, userId);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      default:
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Không biết làm gì. Có thể dùng: show, add, remove',
          },
        });
    }
  } catch (error) {
    console.error('Error in blacklist command:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Đang có lỗi với blacklist command. Vui lòng thử lại sau.',
      },
    });
  }
}
