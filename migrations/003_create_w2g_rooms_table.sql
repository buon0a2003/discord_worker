-- Create w2g_rooms table to store Watch2Gether room streamKeys per Discord channel
CREATE TABLE IF NOT EXISTS w2g_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL UNIQUE,
    stream_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_w2g_rooms_channel_id ON w2g_rooms(channel_id); 