/**
 * W2G Rooms service for managing Watch2Gether room streamKeys using D1 database
 */

/**
 * Get the current streamKey for a Discord channel
 * @param {Object} db - D1 database binding
 * @param {string} channelId - Discord channel ID
 * @returns {Promise<string|null>} StreamKey or null if not found
 */
export async function getStreamKey(db, channelId) {
  if (!channelId) return null;

  try {
    const result = await db
      .prepare('SELECT stream_key FROM w2g_rooms WHERE channel_id = ?')
      .bind(channelId)
      .first();

    return result ? result.stream_key : null;
  } catch (error) {
    console.error('Error getting streamKey:', error);
    return null;
  }
}

/**
 * Set the streamKey for a Discord channel
 * @param {Object} db - D1 database binding
 * @param {string} channelId - Discord channel ID
 * @param {string} streamKey - Watch2Gether room streamKey
 * @returns {Promise<boolean>} True if successful
 */
export async function setStreamKey(db, channelId, streamKey) {
  if (!channelId || !streamKey) return false;

  try {
    // Use UPSERT (INSERT OR REPLACE) to handle both new and existing channels
    const result = await db
      .prepare(
        `
        INSERT OR REPLACE INTO w2g_rooms (channel_id, stream_key, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `,
      )
      .bind(channelId, streamKey)
      .run();

    return result.success;
  } catch (error) {
    console.error('Error setting streamKey:', error);
    return false;
  }
}

/**
 * Remove the streamKey for a Discord channel
 * @param {Object} db - D1 database binding
 * @param {string} channelId - Discord channel ID
 * @returns {Promise<boolean>} True if successful
 */
export async function removeStreamKey(db, channelId) {
  if (!channelId) return false;

  try {
    const result = await db
      .prepare('DELETE FROM w2g_rooms WHERE channel_id = ?')
      .bind(channelId)
      .run();

    return result.success;
  } catch (error) {
    console.error('Error removing streamKey:', error);
    return false;
  }
}

/**
 * Get all active W2G rooms
 * @param {Object} db - D1 database binding
 * @returns {Promise<Array>} Array of room objects with channel_id and stream_key
 */
export async function getAllRooms(db) {
  try {
    const result = await db
      .prepare(
        'SELECT channel_id, stream_key, created_at, updated_at FROM w2g_rooms ORDER BY updated_at DESC',
      )
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting all rooms:', error);
    return [];
  }
}

/**
 * Clean up old rooms (older than specified days)
 * @param {Object} db - D1 database binding
 * @param {number} daysOld - Number of days to consider as old (default: 7)
 * @returns {Promise<number>} Number of rooms cleaned up
 */
export async function cleanupOldRooms(db, daysOld = 7) {
  try {
    const result = await db
      .prepare(
        `
        DELETE FROM w2g_rooms 
        WHERE updated_at < datetime('now', '-${daysOld} days')
      `,
      )
      .run();

    console.log(`Cleaned up ${result.changes} old W2G rooms`);
    return result.changes || 0;
  } catch (error) {
    console.error('Error cleaning up old rooms:', error);
    return 0;
  }
}
