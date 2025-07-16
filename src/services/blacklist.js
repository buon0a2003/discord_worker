/**
 * Blacklist service for managing blocked users using D1 database
 */

/**
 * Get all blacklisted users from database
 * @param {Object} db - D1 database binding
 * @returns {Promise<string[]>} Array of blacklisted user IDs
 */
export async function getBlacklistedUsers(db) {
  try {
    const result = await db.prepare('SELECT user_id FROM blacklist').all();
    return result.results.map((row) => row.user_id);
  } catch (error) {
    console.error('Error getting blacklisted users:', error);
    return [];
  }
}

/**
 * Check if a user is blacklisted
 * @param {Object} db - D1 database binding
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if user is blacklisted
 */
export async function isUserBlacklisted(db, userId) {
  if (!userId) return false;

  try {
    const result = await db
      .prepare('SELECT 1 FROM blacklist WHERE user_id = ?')
      .bind(userId)
      .first();
    return result !== null;
  } catch (error) {
    console.error('Error checking if user is blacklisted:', error);
    return false;
  }
}

/**
 * Add a user to the blacklist
 * @param {Object} db - D1 database binding
 * @param {string} userId - User ID to add
 * @returns {Promise<string>} Success or error message
 */
export async function addUserToBlacklist(db, userId) {
  if (!userId || userId.trim() === '') {
    return '❌ User ID không được để trống';
  }

  const cleanUserId = userId.trim();

  try {
    // Add user to blacklist (UNIQUE constraint will prevent duplicates)
    const result = await db
      .prepare('INSERT INTO blacklist (user_id) VALUES (?)')
      .bind(cleanUserId)
      .run();

    if (result.success) {
      return `✅ Đã thêm user <@${cleanUserId}> vào blacklist`;
    } else {
      return '❌ Có lỗi khi thêm user vào blacklist';
    }
  } catch (error) {
    console.error('Error adding user to blacklist:', error);
    // Check if it's a unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return `❌ User <@${cleanUserId}> đã có trong blacklist rồi`;
    }
    return '❌ Có lỗi khi thêm user vào blacklist';
  }
}

/**
 * Remove a user from the blacklist
 * @param {Object} db - D1 database binding
 * @param {string} userId - User ID to remove
 * @returns {Promise<string>} Success or error message
 */
export async function removeUserFromBlacklist(db, userId) {
  if (!userId || userId.trim() === '') {
    return '❌ User ID không được để trống';
  }

  const cleanUserId = userId.trim();

  try {
    // Check if user is in blacklist
    const isBlacklisted = await isUserBlacklisted(db, cleanUserId);
    if (!isBlacklisted) {
      return `❌ User <@${cleanUserId}> không có trong blacklist`;
    }

    // Remove user from blacklist
    await db
      .prepare('DELETE FROM blacklist WHERE user_id = ?')
      .bind(cleanUserId)
      .run();

    return `✅ Đã xóa user <@${cleanUserId}> khỏi blacklist`;
  } catch (error) {
    console.error('Error removing user from blacklist:', error);
    return '❌ Có lỗi khi xóa user khỏi blacklist';
  }
}

/**
 * Get a formatted list of all blacklisted users
 * @param {Object} db - D1 database binding
 * @returns {Promise<string>} Formatted blacklist display
 */
export async function getBlacklistDisplay(db) {
  try {
    const users = await getBlacklistedUsers(db);

    if (users.length === 0) {
      return '📜 **Blacklist**\n\nKhông có user nào trong blacklist';
    }

    const userMentions = users
      .map((userId) => `• <@${userId}> (${userId})`)
      .join('\n');
    return `📜 **Blacklist** (${users.length} users)\n\n${userMentions}`;
  } catch (error) {
    console.error('Error getting blacklist display:', error);
    return '❌ Có lỗi khi hiển thị blacklist';
  }
}
