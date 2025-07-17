const W2G_API_BASE = 'https://api.w2g.tv';

async function postJson({ url, body }) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response text first
    const responseText = await response.text();

    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      if (response.ok) {
        // Some APIs return empty success responses
        return { success: true };
      } else {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText} (Empty response)`,
        );
        error.statusCode = response.status;
        throw error;
      }
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If it's not JSON, include the raw response in the error
      const error = new Error(`Invalid JSON response: ${parseError.message}`);
      error.statusCode = response.status;
      error.rawResponse = responseText;
      error.originalError = parseError;
      throw error;
    }

    // Check for HTTP error status codes
    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
      error.statusCode = response.status;
      error.response = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.statusCode) {
      throw err; // Re-throw HTTP errors
    }

    // Handle network or other errors
    const error = new Error(`Request failed: ${err.message}`);
    error.originalError = err;
    throw error;
  }
}

/**
 * Create a new Watch2Gether room
 * @param {Object} options
 * @param {string} options.apiKey - Your Watch2Gether API key
 * @param {string} [options.share] - Video URL to preload in the room
 * @returns {Promise<Object>} - Room info including streamkey
 */
async function createRoom({ apiKey, share }) {
  if (!apiKey) throw new Error('W2G API key is required');
  const payload = {
    w2g_api_key: apiKey,
  };
  if (share) payload.share = share;

  return postJson({
    url: `${W2G_API_BASE}/rooms/create.json`,
    body: payload,
  });
}

/**
 * Share a new item (video) to an existing room
 * @param {Object} options
 * @param {string} options.apiKey - Your Watch2Gether API key
 * @param {string} options.streamkey - The room's streamkey
 * @param {string} options.itemUrl - The video URL to share
 * @returns {Promise<Object>} - API response
 */
async function shareItem({ apiKey, streamkey, itemUrl }) {
  if (!apiKey || !streamkey || !itemUrl)
    throw new Error('apiKey, streamkey, and itemUrl are required');
  const payload = {
    w2g_api_key: apiKey,
    item_url: itemUrl,
  };

  return postJson({
    url: `${W2G_API_BASE}/rooms/${streamkey}/sync_update`,
    body: payload,
  });
}

/**
 * Add items to the current playlist in a room
 * @param {Object} options
 * @param {string} options.apiKey - Your Watch2Gether API key
 * @param {string} options.streamkey - The room's streamkey
 * @param {Array<{url: string, title?: string}>} options.addItems - Array of items to add
 * @returns {Promise<Object>} - API response
 */
async function addToPlaylist({ apiKey, streamkey, addItems }) {
  if (
    !apiKey ||
    !streamkey ||
    !Array.isArray(addItems) ||
    addItems.length === 0
  )
    throw new Error('apiKey, streamkey, and addItems[] are required');
  const payload = {
    w2g_api_key: apiKey,
    add_items: addItems,
  };

  return postJson({
    url: `${W2G_API_BASE}/rooms/${streamkey}/playlists/current/playlist_items/sync_update`,
    body: payload,
  });
}

export { createRoom, shareItem, addToPlaylist };
