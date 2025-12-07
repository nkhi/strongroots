const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active questions
router.get('/questions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM questions 
      WHERE active = true 
      ORDER BY "order" ASC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add a new question
router.post('/questions', async (req, res) => {
  const { id, text, order, active, date } = req.body;
  if (!id || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    await db.query(`
      INSERT INTO questions (id, text, "order", active, date)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, text, order || 999, active !== undefined ? active : true, date || '']);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all diary entries (bulk fetch for initial load)
router.get('/diary', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM diary_entries');
    
    const diaryByDate = {};
    result.rows.forEach(e => {
      const dateStr = typeof e.date === 'string' ? e.date : e.date.toISOString().split('T')[0];
      
      if (!diaryByDate[dateStr]) diaryByDate[dateStr] = [];
      
      diaryByDate[dateStr].push({
        id: e.id,
        date: dateStr,
        questionId: e.question_id,
        answer: e.answer,
        createdAt: e.created_at
      });
    });
    res.json(diaryByDate);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a single diary entry
router.post('/diary-entries', async (req, res) => {
  const { id, date, questionId, answer, createdAt } = req.body;
  if (!id || !date || !questionId) {
    return res.status(400).json({ error: 'Missing required fields: id, date, questionId' });
  }
  
  try {
    await db.query(`
      INSERT INTO diary_entries (id, date, question_id, answer, created_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET 
        answer = EXCLUDED.answer,
        date = EXCLUDED.date,
        question_id = EXCLUDED.question_id
    `, [id, date, questionId, answer || '', createdAt || new Date().toISOString()]);
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update a single diary entry
router.patch('/diary-entries/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Build dynamic update query
  const fields = [];
  const values = [id];
  let idx = 2;
  
  if (updates.answer !== undefined) {
    fields.push(`answer = $${idx++}`);
    values.push(updates.answer);
  }
  if (updates.date !== undefined) {
    fields.push(`date = $${idx++}`);
    values.push(updates.date);
  }
  if (updates.questionId !== undefined) {
    fields.push(`question_id = $${idx++}`);
    values.push(updates.questionId);
  }
  
  if (fields.length === 0) {
    return res.json({ ok: true }); // Nothing to update
  }
  
  try {
    const result = await db.query(`
      UPDATE diary_entries 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diary entry not found' });
    }
    
    const e = result.rows[0];
    const dateStr = typeof e.date === 'string' ? e.date : e.date.toISOString().split('T')[0];
    
    res.json({
      id: e.id,
      date: dateStr,
      questionId: e.question_id,
      answer: e.answer,
      createdAt: e.created_at
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a single diary entry
router.delete('/diary-entries/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM diary_entries WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diary entry not found' });
    }
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
