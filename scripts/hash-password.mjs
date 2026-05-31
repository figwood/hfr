#!/usr/bin/env node
/**
 * Usage:  node scripts/hash-password.mjs <username> <password>
 *
 * Outputs a ready-to-run INSERT SQL statement for the D1 users table.
 * Copy the output and run it in the Cloudflare D1 console or with:
 *   wrangler d1 execute hfr-db --remote --command "<INSERT ...>"
 */
import { randomBytes, createHash } from 'node:crypto'

const [, , username, password] = process.argv

if (!username || !password) {
  console.error('Usage: node scripts/hash-password.mjs <username> <password>')
  process.exit(1)
}

const id = crypto.randomUUID()
const salt = randomBytes(16).toString('hex')
const hash = createHash('sha256').update(salt + password).digest('hex')
const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

console.log('\n-- Run this in Cloudflare D1 console or via wrangler:\n')
console.log(
  `INSERT INTO users (id, username, salt, password_hash, created_at) VALUES ('${id}', '${username}', '${salt}', '${hash}', '${now}');`
)
console.log('\n-- Done. Keep the password safe; it is not stored anywhere.\n')
