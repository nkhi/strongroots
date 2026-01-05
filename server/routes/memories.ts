import express, { Request, Response } from 'express';
import * as db from '../db.ts';
import type { DbMemory } from '../db-types.ts';
import type { Memory, CreateMemoryRequest } from '../../shared/types.ts';

const router = express.Router();

// Get memories in a date range
router.get('/memories', async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  if (!from || !to) return res.status(400).json({ error: 'Missing from/to' });

  try {
    const result = await db.query<DbMemory>(`
      SELECT * FROM memories 
      WHERE date >= $1 AND date <= $2
      ORDER BY date DESC, created_at DESC
    `, [from, to]);

    // Convert DB types to API types
    const memories: Memory[] = result.rows.map(m => ({
      id: m.id,
      text: m.text,
      date: m.date.toISOString().split('T')[0],
      createdAt: m.created_at ? m.created_at.toISOString() : null
    }));

    res.json(memories);
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }
});

// Create a new memory
router.post('/memory', async (req: Request<object, object, CreateMemoryRequest>, res: Response) => {
  const { id, text, date, createdAt } = req.body;
  if (!id || !text || !date) {
    return res.status(400).json({ error: 'Missing required fields: id, text, date' });
  }

  try {
    await db.query(`
      INSERT INTO memories (id, text, date, created_at)
      VALUES ($1, $2, $3, $4)
    `, [id, text, date, createdAt || new Date().toISOString()]);

    res.json({ ok: true });
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;
