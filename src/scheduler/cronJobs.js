/**
 * Scheduled/Cron job handlers
 */
import { updateChannelName } from '../services/lunarNewYear.js';

export async function scheduled(_event, env) {
  console.log('🕐 Cron trigger activated - updating channel name');

  try {
    await updateChannelName(env.DISCORD_TOKEN, env.VOICE_CHANNEL_ID);
    console.log('✅ Scheduled channel name update completed');
  } catch (error) {
    console.error('❌ Error in scheduled channel name update:', error);
  }
}
