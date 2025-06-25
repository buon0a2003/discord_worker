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

// Store custom gacha lists in memory (in production, you'd want to use a database)
const customGachaLists = new Map();

/**
 * Get a random gacha item using the Random.org API
 * @param {string} apiKey - Random.org API key
 * @param {string} listName - Optional list name, defaults to main list
 * @returns {Promise<string|null>} Random gacha option or null if error
 */
export async function getRandomGachaItem(apiKey, listName = null) {
  try {
    const options = listName ? customGachaLists.get(listName) : GACHA_OPTIONS;

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
 * @param {string} listName - Optional list name, defaults to main list
 * @returns {string} Formatted string of all gacha options
 */
export function getGachaOptions(listName = null) {
  const options = listName ? customGachaLists.get(listName) : GACHA_OPTIONS;

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
}

/**
 * Create a new custom gacha list
 * @param {string} listName - Name of the new list
 * @param {string[]} options - Array of options for the list
 * @returns {string} Success or error message
 */
export function createCustomGachaList(listName, options) {
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

  customGachaLists.set(cleanListName, cleanOptions);
  return `✅ Đã tạo list '${cleanListName}' với ${cleanOptions.length} options`;
}

/**
 * Add options to an existing custom gacha list
 * @param {string} listName - Name of the existing list
 * @param {string[]} newOptions - Array of new options to add
 * @returns {string} Success or error message
 */
export function addToCustomGachaList(listName, newOptions) {
  if (!listName || listName.trim() === '') {
    return '❌ Tên list không được để trống';
  }

  const cleanListName = listName.trim();

  if (!customGachaLists.has(cleanListName)) {
    return `❌ List '${cleanListName}' không tồn tại. Tạo nó ra trước.`;
  }

  if (!newOptions || newOptions.length === 0) {
    return '❌ Phải có ít nhất 1 option để thêm';
  }

  const cleanNewOptions = newOptions
    .map((opt) => opt.trim())
    .filter((opt) => opt !== '');

  if (cleanNewOptions.length === 0) {
    return '❌ Phải có ít nhất 1 option hợp lệ để thêm';
  }

  const existingOptions = customGachaLists.get(cleanListName);
  const updatedOptions = [...existingOptions, ...cleanNewOptions];
  customGachaLists.set(cleanListName, updatedOptions);

  return `✅ Đã thêm ${cleanNewOptions.length} option(s) vào '${cleanListName}'. Tổng: ${updatedOptions.length} options`;
}

/**
 * Clear all options from a custom gacha list
 * @param {string} listName - Name of the list to clear
 * @returns {string} Success or error message
 */
export function clearCustomGachaList(listName) {
  if (!listName || listName.trim() === '') {
    return '❌ Tên list không được để trống';
  }

  const cleanListName = listName.trim();

  if (!customGachaLists.has(cleanListName)) {
    return `❌ List '${cleanListName}' không tồn tại`;
  }

  customGachaLists.delete(cleanListName);
  return `✅ Đã xóa và xóa list '${cleanListName}'`;
}

/**
 * Get all custom list names
 * @returns {string} Formatted string of all custom list names
 */
export function getAllCustomListNames() {
  const listNames = Array.from(customGachaLists.keys());

  if (listNames.length === 0) {
    return '📋 Không có list custom nào';
  }

  return (
    '📋 **Danh sách custom:**\n' +
    listNames
      .map(
        (name, index) =>
          `${index + 1}. ${name} (${customGachaLists.get(name).length} options)`,
      )
      .join('\n')
  );
}

export default getRandomGachaItem;
