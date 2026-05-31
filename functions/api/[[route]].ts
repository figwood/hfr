import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { jwt, sign } from 'hono/jwt'
import { cors } from 'hono/cors'

export interface Env {
  DB: D1Database
  AI: Ai
  JWT_SECRET: string
}

type Variables = {
  jwtPayload: { sub: string; username: string; exp: number }
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', cors())

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>()
  if (!username || !password) {
    return c.json({ error: 'Missing username or password' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, salt, password_hash FROM users WHERE username = ?'
  )
    .bind(username)
    .first<{ id: string; salt: string; password_hash: string }>()

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.password_hash) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const secret = c.env.JWT_SECRET
  const payload = {
    sub: user.id,
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }
  const token = await sign(payload, secret)
  return c.json({ token })
})

// ─── JWT middleware for all /api/* except login ───────────────────────────────

app.use('/api/*', async (c, next) => {
  // skip login
  if (c.req.path === '/api/auth/login') return next()
  return jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })(c, next)
})

// ─── Items ───────────────────────────────────────────────────────────────────

app.get('/api/items', async (c) => {
  const userId = c.get('jwtPayload').sub
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM items
     WHERE user_id = ? AND status = 'active'
     ORDER BY expiry_date ASC`
  )
    .bind(userId)
    .all()
  return c.json(results)
})

app.post('/api/items', async (c) => {
  const userId = c.get('jwtPayload').sub
  const body = await c.req.json<{
    id: string
    name: string
    expiry_date: string
    production_date?: string
    shelf_life_days?: number
    notes?: string
  }>()

  if (!body.id || !body.name || !body.expiry_date) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  await c.env.DB.prepare(
    `INSERT INTO items (id, user_id, name, expiry_date, production_date, shelf_life_days, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(body.id, userId, body.name, body.expiry_date, body.production_date ?? null, body.shelf_life_days ?? null, body.notes ?? null)
    .run()

  const item = await c.env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(body.id).first()
  return c.json(item, 201)
})

app.patch('/api/items/:id', async (c) => {
  const userId = c.get('jwtPayload').sub
  const itemId = c.req.param('id')
  const body = await c.req.json<{
    name?: string
    expiry_date?: string
    production_date?: string
    shelf_life_days?: number
    status?: 'active' | 'consumed'
    notes?: string
  }>()

  // verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT id FROM items WHERE id = ? AND user_id = ?'
  )
    .bind(itemId, userId)
    .first()

  if (!existing) return c.json({ error: 'Not found' }, 404)

  const consumed_at = body.status === 'consumed' ? new Date().toISOString() : null

  await c.env.DB.prepare(
    `UPDATE items SET
      name = COALESCE(?, name),
      expiry_date = COALESCE(?, expiry_date),
      production_date = COALESCE(?, production_date),
      shelf_life_days = COALESCE(?, shelf_life_days),
      status = COALESCE(?, status),
      consumed_at = CASE WHEN ? = 'consumed' THEN ? ELSE consumed_at END,
      notes = COALESCE(?, notes)
     WHERE id = ? AND user_id = ?`
  )
    .bind(
      body.name ?? null,
      body.expiry_date ?? null,
      body.production_date ?? null,
      body.shelf_life_days ?? null,
      body.status ?? null,
      body.status ?? null,
      consumed_at,
      body.notes ?? null,
      itemId,
      userId
    )
    .run()

  const updated = await c.env.DB.prepare('SELECT * FROM items WHERE id = ?').bind(itemId).first()
  return c.json(updated)
})

app.delete('/api/items/:id', async (c) => {
  const userId = c.get('jwtPayload').sub
  const itemId = c.req.param('id')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM items WHERE id = ? AND user_id = ?'
  )
    .bind(itemId, userId)
    .first()

  if (!existing) return c.json({ error: 'Not found' }, 404)

  await c.env.DB.prepare('DELETE FROM items WHERE id = ? AND user_id = ?')
    .bind(itemId, userId)
    .run()

  return c.body(null, 204)
})

// ─── History ──────────────────────────────────────────────────────────────────

app.get('/api/history', async (c) => {
  const userId = c.get('jwtPayload').sub
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM items
     WHERE user_id = ? AND status = 'consumed'
     ORDER BY consumed_at DESC`
  )
    .bind(userId)
    .all()
  return c.json(results)
})

// ─── AI Recognition ───────────────────────────────────────────────────────────

app.post('/api/ai/recognize', async (c) => {
  const { image } = await c.req.json<{ image: string }>() // base64 data URL

  if (!image) return c.json({ error: 'Missing image' }, 400)

  // Strip data URL prefix if present
  const base64 = image.replace(/^data:image\/\w+;base64,/, '')
  const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0))

  const prompt =
    'You are a product label reader. Look at this product image and extract: product name, production date, and shelf life. ' +
    'Return ONLY a JSON object with no explanation: ' +
    '{"name":"product name in Chinese if visible","production_date":"YYYY-MM-DD or null","shelf_life_days":number or null}. ' +
    'For shelf life, convert to days (e.g. 12 months = 365, 18 months = 548, 1 year = 365). ' +
    'If a field is not visible, use null.'

  const response = await (c.env.AI as unknown as {
    run: (model: string, input: object) => Promise<{ response?: string; description?: string }>
  }).run('@cf/meta/llama-3.2-11b-vision-instruct', {
    prompt,
    image: [...bytes],
    max_tokens: 300,
  })

  const text = response?.response ?? response?.description ?? ''

  // Try to extract JSON from the model response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return c.json({ success: true, data: parsed })
    } catch {
      // fall through
    }
  }

  return c.json({ success: false, raw: text })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(salt + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequest = handle(app)
