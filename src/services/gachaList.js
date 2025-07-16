import { generateRandomIntegers } from '../api/randomApi.js';

const GACHA_OPTIONS = [
  '🌟 Hôm nay mày may mắn vcl 🌟',
  '✨ Hôm nay mày may mắn',
  '✨ Hôm nay hơi may mắn',
  '😪 Chắc là mai sẽ may mắn',
  '😭 Hơi xui một tí',
  '😠 Đéo may mắn',
  '💩 Hôm nay như shjt',
  '🚗 Ra đường cứ cẩn thận',
];

/**
 * Get gacha options from database or default list
 * @param {Object} db - D1 database binding
 * @param {string} listName - Optional list name, defaults to main list
 * @returns {Promise<string[]>} Array of gacha options
 */
async function getGachaOptionsArray(db, listName = null) {
  if (!listName) {
    return GACHA_OPTIONS;
  }

  try {
    // Get list ID first
    const listResult = await db
      .prepare('SELECT id FROM gacha_lists WHERE name = ?')
      .bind(listName)
      .first();

    if (!listResult) {
      return null;
    }

    // Get options for this list
    const optionsResult = await db
      .prepare(
        'SELECT option_text FROM gacha_options WHERE list_id = ? ORDER BY position',
      )
      .bind(listResult.id)
      .all();

    return optionsResult.results.map((row) => row.option_text);
  } catch (error) {
    console.error('Error getting gacha options from database:', error);
    return null;
  }
}

/**
 * Get a random gacha item using the Random.org API
 * @param {string} apiKey - Random.org API key
 * @param {Object} db - D1 database binding
 * @param {string} listName - Optional list name, defaults to main list
 * @returns {Promise<string|null>} Random gacha option or null if error
 */
export async function getRandomGachaItem(apiKey, db, listName = null) {
  try {
    const options = await getGachaOptionsArray(db, listName);

    if (!options || options.length === 0) {
      return listName
        ? `❌ Ko có list nào tên '${listName}'`
        : '❌ Ko có options nào';
    }

    const randomNumbers = await generateRandomIntegers(
      apiKey,
      1,
      0,
      options.length - 1,
    );

    if (!randomNumbers || randomNumbers.length === 0) {
      console.error('Failed to generate random number');
      return null;
    }

    const randomIndex = randomNumbers[0];
    const selectedOption = options[randomIndex];

    console.log(
      `Random index: ${randomIndex}, Selected option: ${selectedOption}`,
    );
    return selectedOption;
  } catch (error) {
    console.error('Error getting random gacha item:', error);
    return null;
  }
}

/**
 * Get the list of gacha options
 * @param {Object} db - D1 database binding
 * @param {string} listName - Optional list name, defaults to main list
 * @returns {Promise<string>} Formatted string of all gacha options
 */
export async function getGachaOptions(db, listName = null) {
  try {
    const options = await getGachaOptionsArray(db, listName);

    if (!options || options.length === 0) {
      return listName
        ? `❌ Ko có list nào tên '${listName}'`
        : '❌ Ko có options nào';
    }

    const header = listName
      ? `📋 Custom List: **${listName}**\n`
      : '📋 **Danh sách gacha Default**\n';
    return (
      header +
      options.map((option, index) => `${index + 1}. ${option}`).join('\n')
    );
  } catch (error) {
    console.error('Error getting gacha options:', error);
    return '❌ Có lỗi khi hiển thị gacha list';
  }
}

/**
 * Create a new custom gacha list
 * @param {Object} db - D1 database binding
 * @param {string} listName - Name of the new list
 * @param {string[]} options - Array of options for the list
 * @returns {Promise<string>} Success or error message
 */
export async function createCustomGachaList(db, listName, options) {
  if (!listName || listName.trim() === '') {
    return '❌ Tên list không được để trống';
  }

  if (!options || options.length === 0) {
    return '❌ Phải có ít nhất 1 option';
  }

  const cleanListName = listName.trim();
  const cleanOptions = options
    .map((opt) => opt.trim())
    .filter((opt) => opt !== '');

  if (cleanOptions.length === 0) {
    return '❌ Phải có ít nhất 1 option hợp lệ';
  }

  try {
    // Insert the list first
    const listResult = await db
      .prepare('INSERT INTO gacha_lists (name) VALUES (?)')
      .bind(cleanListName)
      .run();

    if (!listResult.success) {
      return '❌ Có lỗi khi tạo gacha list';
    }

    const listId = listResult.meta.last_row_id;

    // Insert all options
    for (let i = 0; i < cleanOptions.length; i++) {
      await db
        .prepare(
          'INSERT INTO gacha_options (list_id, option_text, position) VALUES (?, ?, ?)',
        )
        .bind(listId, cleanOptions[i], i)
        .run();
    }

    return `✅ Đã tạo list '${cleanListName}' với ${cleanOptions.length} options`;
  } catch (error) {
    console.error('Error creating custom gacha list:', error);
    // Check if it's a unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return `❌ List '${cleanListName}' đã tồn tại rồi`;
    }
    return '❌ Có lỗi khi tạo gacha list';
  }
}

/**
 * Add options to an existing custom gacha list
 * @param {Object} db - D1 database binding
 * @param {string} listName - Name of the existing list
 * @param {string[]} newOptions - Array of new options to add
 * @returns {Promise<string>} Success or error message
 */
export async function addToCustomGachaList(db, listName, newOptions) {
  if (!listName || listName.trim() === '') {
    return '❌ Tên list không được để trống';
  }

  const cleanListName = listName.trim();

  if (!newOptions || newOptions.length === 0) {
    return '❌ Phải có ít nhất 1 option để thêm';
  }

  const cleanNewOptions = newOptions
    .map((opt) => opt.trim())
    .filter((opt) => opt !== '');

  if (cleanNewOptions.length === 0) {
    return '❌ Phải có ít nhất 1 option hợp lệ để thêm';
  }

  try {
    // Check if list exists and get its ID
    const listResult = await db
      .prepare('SELECT id FROM gacha_lists WHERE name = ?')
      .bind(cleanListName)
      .first();

    if (!listResult) {
      return `❌ List '${cleanListName}' không tồn tại. Tạo nó ra trước.`;
    }

    const listId = listResult.id;

    // Get current highest position
    const positionResult = await db
      .prepare(
        'SELECT COALESCE(MAX(position), -1) as max_position FROM gacha_options WHERE list_id = ?',
      )
      .bind(listId)
      .first();

    let currentPosition = positionResult.max_position + 1;

    // Insert new options
    for (const option of cleanNewOptions) {
      await db
        .prepare(
          'INSERT INTO gacha_options (list_id, option_text, position) VALUES (?, ?, ?)',
        )
        .bind(listId, option, currentPosition)
        .run();
      currentPosition++;
    }

    // Get total count
    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM gacha_options WHERE list_id = ?')
      .bind(listId)
      .first();

    return `✅ Đã thêm ${cleanNewOptions.length} option(s) vào '${cleanListName}'. Tổng: ${countResult.total} options`;
  } catch (error) {
    console.error('Error adding to custom gacha list:', error);
    return '❌ Có lỗi khi thêm options vào gacha list';
  }
}

/**
 * Clear all options from a custom gacha list
 * @param {Object} db - D1 database binding
 * @param {string} listName - Name of the list to clear
 * @returns {Promise<string>} Success or error message
 */
export async function clearCustomGachaList(db, listName) {
  if (!listName || listName.trim() === '') {
    return '❌ Tên list không được để trống';
  }

  const cleanListName = listName.trim();

  try {
    // Check if list exists
    const listResult = await db
      .prepare('SELECT id FROM gacha_lists WHERE name = ?')
      .bind(cleanListName)
      .first();

    if (!listResult) {
      return `❌ List '${cleanListName}' không tồn tại`;
    }

    // Delete the list (cascade will delete options)
    await db
      .prepare('DELETE FROM gacha_lists WHERE name = ?')
      .bind(cleanListName)
      .run();

    return `✅ Đã xóa list '${cleanListName}'`;
  } catch (error) {
    console.error('Error clearing custom gacha list:', error);
    return '❌ Có lỗi khi xóa gacha list';
  }
}

/**
 * Get all custom list names
 * @param {Object} db - D1 database binding
 * @returns {Promise<string>} Formatted string of all custom list names
 */
export async function getAllCustomListNames(db) {
  try {
    const result = await db
      .prepare(
        `
      SELECT gl.name, COUNT(go.id) as option_count 
      FROM gacha_lists gl 
      LEFT JOIN gacha_options go ON gl.id = go.list_id 
      GROUP BY gl.id, gl.name 
      ORDER BY gl.name
    `,
      )
      .all();

    if (result.results.length === 0) {
      return '📋 Không có list custom nào';
    }

    return (
      '📋 **Danh sách custom:**\n' +
      result.results
        .map(
          (row, index) =>
            `${index + 1}. ${row.name} (${row.option_count} options)`,
        )
        .join('\n')
    );
  } catch (error) {
    console.error('Error getting custom list names:', error);
    return '❌ Có lỗi khi hiển thị danh sách custom';
  }
}

export default getRandomGachaItem;
