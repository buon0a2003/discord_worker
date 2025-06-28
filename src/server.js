/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import { verifyDiscordRequest } from './middleware/discord.js';
import { handleInteraction } from './routes/interactions.js';
import { scheduled } from './scheduler/cronJobs.js';

const router = AutoRouter();

router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request, env) => {
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  return await handleInteraction(interaction, env);
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
  scheduled,
};

export default server;
