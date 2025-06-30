/**
 * Blacklist service for managing blocked users
 */

// Default blacklisted user IDs
const DEFAULT_BLACKLISTED_USERS = [];

// Store blacklisted users in memory (in production, you'd want to use a database)
const blacklistedUsers = new Set(DEFAULT_BLACKLISTED_USERS);

/**
 * Get all blacklisted users
 * @returns {string[]} Array of blacklisted user IDs
 */
export function getBlacklistedUsers() {
  return Array.from(blacklistedUsers);
}

/**
 * Check if a user is blacklisted
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is blacklisted
 */
export function isUserBlacklisted(userId) {
  if (!userId) return false;
  return blacklistedUsers.has(userId);
}

/**
 * Add a user to the blacklist
 * @param {string} userId - User ID to add
 * @returns {string} Success or error message
 */
export function addUserToBlacklist(userId) {
  if (!userId || userId.trim() === '') {
    return '❌ User ID không được để trống';
  }

  const cleanUserId = userId.trim();

  if (blacklistedUsers.has(cleanUserId)) {
    return `❌ User <@${cleanUserId}> đã có trong blacklist rồi`;
  }

  blacklistedUsers.add(cleanUserId);
  return `✅ Đã thêm user <@${cleanUserId}> vào blacklist`;
}

/**
 * Remove a user from the blacklist
 * @param {string} userId - User ID to remove
 * @returns {string} Success or error message
 */
export function removeUserFromBlacklist(userId) {
  if (!userId || userId.trim() === '') {
    return '❌ User ID không được để trống';
  }

  const cleanUserId = userId.trim();

  if (!blacklistedUsers.has(cleanUserId)) {
    return `❌ User <@${cleanUserId}> không có trong blacklist`;
  }

  blacklistedUsers.delete(cleanUserId);
  return `✅ Đã xóa user <@${cleanUserId}> khỏi blacklist`;
}

/**
 * Get a formatted list of all blacklisted users
 * @returns {string} Formatted blacklist display
 */
export function getBlacklistDisplay() {
  const users = getBlacklistedUsers();

  if (users.length === 0) {
    return '📜 **Blacklist**\n\nKhông có user nào trong blacklist';
  }

  const userMentions = users
    .map((userId) => `• <@${userId}> (${userId})`)
    .join('\n');
  return `📜 **Blacklist** (${users.length} users)\n\n${userMentions}`;
}
