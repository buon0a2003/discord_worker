-- Create gacha_lists table to store custom gacha list metadata
CREATE TABLE IF NOT EXISTS gacha_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create gacha_options table to store individual options for each list
CREATE TABLE IF NOT EXISTS gacha_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (list_id) REFERENCES gacha_lists(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gacha_lists_name ON gacha_lists(name);
CREATE INDEX IF NOT EXISTS idx_gacha_options_list_id ON gacha_options(list_id);
CREATE INDEX IF NOT EXISTS idx_gacha_options_position ON gacha_options(list_id, position); 