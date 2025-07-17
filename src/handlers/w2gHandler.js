import { InteractionResponseType } from 'discord-interactions';
import { JsonResponse } from '../utils/JsonResponse.js';
import { createRoom, addToPlaylist, shareItem } from '../api/w2gApi.js';
import { getStreamKey, setStreamKey } from '../services/w2gRooms.js';

export async function handleYtCommand(interaction, env) {
  const channelId = interaction.channel_id;
  const targetUserId = interaction.member?.user?.id || interaction.user?.id;

  const link = interaction.data.options.find(
    (opt) => opt.name === 'link',
  )?.value;

  if (!link) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ You must provide a YouTube link.' },
    });
  }

  if (!env.W2G_API_KEY) {
    console.error('W2G_API_KEY is not configured');
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ Watch2Gether API key is not configured.' },
    });
  }

  try {
    const apiKey = env.W2G_API_KEY;
    console.log('Creating W2G room with link:', link);
    const room = await createRoom({ apiKey, share: link });

    if (!room || !room.streamkey) {
      console.error('Invalid room response:', room);
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Failed to create room: Invalid response from W2G API.',
        },
      });
    }

    const streamKey = room.streamkey;

    // Store streamKey in D1 database
    const success = await setStreamKey(env.DB, channelId, streamKey);
    if (!success) {
      console.error('Failed to store streamKey in database');
    }

    console.log('Room created successfully:', streamKey);

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `✅ <@${targetUserId}> Room created: https://w2g.tv/rooms/${streamKey}`,
      },
    });
  } catch (err) {
    console.error('Error creating W2G room:', err);
    console.error('Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      rawResponse: err.rawResponse,
      originalError: err.originalError,
    });

    let errorMessage = '❌ Failed to create room.';
    if (err.statusCode === 401) {
      errorMessage = '❌ Invalid Watch2Gether API key.';
    } else if (err.statusCode === 400) {
      errorMessage = '❌ Invalid request. Please check the YouTube link.';
    } else if (err.message.includes('timeout')) {
      errorMessage = '❌ Request timeout. Please try again.';
    } else if (err.message.includes('JSON')) {
      errorMessage = '❌ Invalid response from Watch2Gether API.';
    }

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: errorMessage },
    });
  }
}

export async function handleAddSongCommand(interaction, env) {
  const channelId = interaction.channel_id;
  const link = interaction.data.options.find(
    (opt) => opt.name === 'link',
  )?.value;
  const title = interaction.data.options.find(
    (opt) => opt.name === 'title',
  )?.value;

  // Get streamKey from D1 database
  const streamKey = await getStreamKey(env.DB, channelId);

  if (!streamKey) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ No active room. Use /yt first.' },
    });
  }

  if (!env.W2G_API_KEY) {
    console.error('W2G_API_KEY is not configured');
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ Watch2Gether API key is not configured.' },
    });
  }

  try {
    const apiKey = env.W2G_API_KEY;
    const addItems = [{ url: link }];
    if (title) addItems[0].title = title;

    console.log('Adding song to playlist:', link, title ? `(${title})` : '');
    console.log('Using streamKey:', streamKey);
    console.log(
      'API URL:',
      `https://api.w2g.tv/rooms/${streamKey}/playlists/current/playlist_items/sync_update`,
    );

    const result = await addToPlaylist({
      apiKey,
      streamkey: streamKey,
      addItems,
    });
    console.log('Add to playlist result:', result);

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '✅ Song added to playlist.' },
    });
  } catch (err) {
    console.error('Error adding song to playlist:', err);
    console.error('Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      rawResponse: err.rawResponse,
      originalError: err.originalError,
    });

    let errorMessage = '❌ Failed to add song.';
    if (err.statusCode === 401) {
      errorMessage = '❌ Invalid Watch2Gether API key.';
    } else if (err.statusCode === 400) {
      errorMessage = '❌ Invalid request. Please check the link.';
    } else if (err.statusCode === 404) {
      errorMessage = '❌ Room not found. Please create a new room with /yt.';
    } else if (err.message.includes('JSON')) {
      errorMessage = '❌ Invalid response from Watch2Gether API.';
    }

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: errorMessage },
    });
  }
}

export async function handlePlaySongCommand(interaction, env) {
  const channelId = interaction.channel_id;
  const link = interaction.data.options.find(
    (opt) => opt.name === 'link',
  )?.value;

  // Get streamKey from D1 database
  const streamKey = await getStreamKey(env.DB, channelId);

  if (!streamKey) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ No active room. Use /yt first.' },
    });
  }

  if (!env.W2G_API_KEY) {
    console.error('W2G_API_KEY is not configured');
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '❌ Watch2Gether API key is not configured.' },
    });
  }

  try {
    const apiKey = env.W2G_API_KEY;
    console.log('Playing song immediately:', link);
    console.log('Using streamKey:', streamKey);
    console.log(
      'API URL:',
      `https://api.w2g.tv/rooms/${streamKey}/sync_update`,
    );

    const result = await shareItem({
      apiKey,
      streamkey: streamKey,
      itemUrl: link,
    });
    console.log('Share item result:', result);

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '▶️ Song is now playing!' },
    });
  } catch (err) {
    console.error('Error playing song:', err);
    console.error('Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      rawResponse: err.rawResponse,
      originalError: err.originalError,
    });

    let errorMessage = '❌ Failed to play song.';
    if (err.statusCode === 401) {
      errorMessage = '❌ Invalid Watch2Gether API key.';
    } else if (err.statusCode === 400) {
      errorMessage = '❌ Invalid request. Please check the link.';
    } else if (err.statusCode === 404) {
      errorMessage = '❌ Room not found. Please create a new room with /yt.';
    } else if (err.message.includes('JSON')) {
      errorMessage = '❌ Invalid response from Watch2Gether API.';
    }

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: errorMessage },
    });
  }
}
