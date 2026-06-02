-- Migration: 0002_add_tag.sql
-- Run: wrangler d1 execute hfr-db --file=./migrations/0002_add_tag.sql

ALTER TABLE items ADD COLUMN tag TEXT;
