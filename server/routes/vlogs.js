const express = require('express');
const router = express.Router();
const db = require('../db');

// Get vlog for a specific week
router.get('/vlogs/:weekStartDate', async (req, res) => {
  const { weekStartDate } = req.params;
  try {
    const result = await db.query(`
      SELECT * FROM vlogs WHERE week_start_date = $1
    `, [weekStartDate]);
    
    if (result.rows.length === 0) return res.json(null);
    
    const v = result.rows[0];
    res.json({
      weekStartDate: v.week_start_date, // Date object might need formatting? Postgres returns Date object
      videoUrl: v.video_url,
      embedHtml: v.embed_html
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Save a vlog for a specific week
router.post('/vlogs', async (req, res) => {
  const { weekStartDate, videoUrl, embedHtml } = req.body;
  if (!weekStartDate || !videoUrl || !embedHtml) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    await db.query(`
      INSERT INTO vlogs (week_start_date, video_url, embed_html)
      VALUES ($1, $2, $3)
      ON CONFLICT (week_start_date)
      DO UPDATE SET video_url = EXCLUDED.video_url, embed_html = EXCLUDED.embed_html
    `, [weekStartDate, videoUrl, embedHtml]);
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
