const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active next items
router.get('/next', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM next_items 
      WHERE deleted_at IS NULL AND started_at IS NULL
    `);
    
    const items = result.rows.map(item => ({
      ...item,
      createdAt: item.created_at,
      deletedAt: item.deleted_at,
      startedAt: item.started_at
    }));
    
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add a new next item
router.post('/next', async (req, res) => {
  const { id, title, content, color, size } = req.body;
  if (!id || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const createdAt = new Date().toISOString();
    await db.query(`
      INSERT INTO next_items (id, title, content, color, size, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, title, content || '', color || '#2D2D2D', size || 'medium', createdAt]);
    
    res.json({
      id, title, content, color, size, createdAt, deletedAt: null, startedAt: null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update a next item
router.patch('/next/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Map camelCase to snake_case for DB
  const dbUpdates = {};
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.content) dbUpdates.content = updates.content;
  if (updates.color) dbUpdates.color = updates.color;
  if (updates.size) dbUpdates.size = updates.size;
  if (updates.deletedAt) dbUpdates.deleted_at = updates.deletedAt;
  if (updates.startedAt) dbUpdates.started_at = updates.startedAt;
  
  if (Object.keys(dbUpdates).length === 0) return res.json({ ok: true }); // Nothing to update

  try {
    const setClause = Object.keys(dbUpdates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(dbUpdates);
    
    const result = await db.query(`
      UPDATE next_items 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = result.rows[0];
    res.json({
      ...item,
      createdAt: item.created_at,
      deletedAt: item.deleted_at,
      startedAt: item.started_at
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
