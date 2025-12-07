const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active habits (ordered)
router.get('/habits', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM habits 
      WHERE active = true 
      ORDER BY "order" ASC, id ASC
    `);
    
    // Convert types to match frontend expectations
    const habits = result.rows.map(h => ({
      ...h,
      defaultTime: h.default_time, // map snake_case to camelCase
      createdDate: h.created_date
    }));
    
    res.json(habits);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get entries in a date range
router.get('/habit-entries', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'Missing from/to' });
  
  try {
    const result = await db.query(`
      SELECT * FROM entries 
      WHERE date >= $1 AND date <= $2
    `, [from, to]);
    
    const entries = result.rows.map(e => ({
      ...e,
      entryId: e.entry_id,
      habitId: e.habit_id
    }));
    
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upsert a habit entry
router.post('/habit-entry', async (req, res) => {
  const { entryId, date, habitId, state, timestamp } = req.body;
  if (!entryId || !date || !habitId)
    return res.status(400).json({ error: 'Missing key fields' });
  
  try {
    await db.query(`
      INSERT INTO entries (entry_id, date, habit_id, state, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (entry_id) 
      DO UPDATE SET state = EXCLUDED.state, timestamp = EXCLUDED.timestamp
    `, [entryId, date, habitId, state, timestamp]);
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Seed/replace HabitConfig (Not typically used in prod, but kept for compatibility)
router.post('/seed-habits', async (req, res) => {
  // Skipping implementation as it's destructive and we have real data now
  res.status(501).json({ error: 'Seeding disabled in DB mode' });
});

module.exports = router;
