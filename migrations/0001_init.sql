-- Migration: 0001_init.sql
-- Run: wrangler d1 execute hfr-db --file=./migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  salt        TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id),
  name             TEXT NOT NULL,
  expiry_date      TEXT NOT NULL,  -- YYYY-MM-DD
  production_date  TEXT,           -- YYYY-MM-DD, optional
  shelf_life_days  INTEGER,        -- informational only
  status           TEXT NOT NULL DEFAULT 'active', -- 'active' | 'consumed'
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  consumed_at      TEXT,
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_items_user_status_expiry
  ON items(user_id, status, expiry_date);
