CREATE TABLE IF NOT EXISTS blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    duration INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON blacklist(user_id);