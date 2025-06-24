/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
// import { InteractionResponseFlags } from 'discord-interactions';
import { TET, RANDOM, GACHA, GACHA_LIST, CHUIDUNG } from './commands.js';
import { updateChannelName, getDaysUntilLunarNewYear } from './lunarNewYear.js';
import { generateRandomIntegers } from './RandomApi.js';
import {
  getRandomGachaItem,
  getGachaOptions,
  createCustomGachaList,
  addToCustomGachaList,
  clearCustomGachaList,
  getAllCustomListNames,
} from './GachaList.js';

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = AutoRouter();

router.get('/', (request, env) => {
  return new Response(`👋 ${env.VOICE_CHANNEL_ID}`);
});

router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    switch (interaction.data.name.toLowerCase()) {
      case TET.name.toLowerCase(): {
        const remainingDays = getDaysUntilLunarNewYear();

        await updateChannelName(env.DISCORD_TOKEN, env.VOICE_CHANNEL_ID);
        // console.log('test:', env.DISCORD_TOKEN + ' - ' + env.VOICE_CHANNEL_ID);
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Đã update lại: Còn ${remainingDays} ngày nữa!`,
          },
        });
      }
      case RANDOM.name.toLowerCase(): {
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
                content:
                  '❌ Giá trị nhỏ nhất không được lớn hơn giá trị lớn nhất!',
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
              content:
                '❌ Failed to generate random number. Vui lòng thử lại sau.',
            },
          });
        }
      }
      case GACHA.name.toLowerCase(): {
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
      case GACHA_LIST.name.toLowerCase(): {
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
              const nameOption = subcommandOptions.find(
                (opt) => opt.name === 'name',
              );
              const listName = nameOption ? nameOption.value : null;
              const gachaList = getGachaOptions(listName);

              return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: gachaList },
              });
            }

            case 'new': {
              const nameOption = subcommandOptions.find(
                (opt) => opt.name === 'name',
              );
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
              const nameOption = subcommandOptions.find(
                (opt) => opt.name === 'name',
              );
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
              const nameOption = subcommandOptions.find(
                (opt) => opt.name === 'name',
              );

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
              content:
                '❌ Đang có lỗi với gacha-list command. Vui lòng thử lại sau.',
            },
          });
        }
      }
      case CHUIDUNG.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'ĐM dũng' },
        });
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

// eslint-disable-next-line no-unused-vars
async function scheduled(_event, env, _ctx) {
  console.log('🕐 Cron trigger activated - updating channel name');

  try {
    await updateChannelName(env.DISCORD_TOKEN, env.VOICE_CHANNEL_ID);
    console.log('✅ Scheduled channel name update completed');
  } catch (error) {
    console.error('❌ Error in scheduled channel name update:', error);
  }
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
  scheduled,
};

export default server;
