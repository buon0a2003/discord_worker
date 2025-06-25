/**
 * Handler for GACHA_LIST command
 */
import { InteractionResponseType } from 'discord-interactions';
import {
  getGachaOptions,
  createCustomGachaList,
  addToCustomGachaList,
  clearCustomGachaList,
  getAllCustomListNames,
} from '../services/gachaList.js';
import { JsonResponse } from '../utils/JsonResponse.js';

export async function handleGachaListCommand(interaction) {
  try {
    const subcommand = interaction.data.options?.[0];
    if (!subcommand) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            '❌ Vui lòng chỉ định một subcommand (show, new, add, clear, lists)',
        },
      });
    }

    const subcommandOptions = subcommand.options || [];

    switch (subcommand.name) {
      case 'show': {
        const nameOption = subcommandOptions.find((opt) => opt.name === 'name');
        const listName = nameOption ? nameOption.value : null;
        const gachaList = getGachaOptions(listName);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: gachaList },
        });
      }

      case 'new': {
        const nameOption = subcommandOptions.find((opt) => opt.name === 'name');
        const optionsOption = subcommandOptions.find(
          (opt) => opt.name === 'options',
        );

        if (!nameOption || !optionsOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Tên list và options là bắt buộc để tạo',
            },
          });
        }

        const listName = nameOption.value;
        const optionsArray = optionsOption.value
          .split(',')
          .map((opt) => opt.trim());
        const result = createCustomGachaList(listName, optionsArray);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      case 'add': {
        const nameOption = subcommandOptions.find((opt) => opt.name === 'name');
        const optionsOption = subcommandOptions.find(
          (opt) => opt.name === 'options',
        );

        if (!nameOption || !optionsOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Tên list và options là bắt buộc để thêm',
            },
          });
        }

        const listName = nameOption.value;
        const newOptionsArray = optionsOption.value
          .split(',')
          .map((opt) => opt.trim());
        const result = addToCustomGachaList(listName, newOptionsArray);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      case 'clear': {
        const nameOption = subcommandOptions.find((opt) => opt.name === 'name');

        if (!nameOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Tên list là bắt buộc để xóa',
            },
          });
        }

        const listName = nameOption.value;
        const result = clearCustomGachaList(listName);

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      case 'lists': {
        const result = getAllCustomListNames();

        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: result },
        });
      }

      default:
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              '❌ Không biết làm gì. Có thể dùng: show, new, add, clear, lists',
          },
        });
    }
  } catch (error) {
    console.error('Error in gacha-list command:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '❌ Đang có lỗi với gacha-list command. Vui lòng thử lại sau.',
      },
    });
  }
}
