const express = require('express');
const cors = require('cors');
const { logToFile } = require('./logger');

console.log('[SERVER] 🏁 Starting server process...');

const app = express();
app.use(cors());
app.use(express.json());

// Comprehensive logging middleware
app.use((req, res, next) => {
  // Skip logging for health checks to keep console clean
  if (req.path === '/health') {
    return next();
  }

  const start = Date.now();
  
  // Wrap res.json to capture body for logging
  const originalJson = res.json;
  res.json = function (body) {
    res.locals = res.locals || {};
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    
    // Colorize status
    const statusIcon = status >= 500 ? '🔥' : status >= 400 ? '⚠️' : '✅';
    
    let extraInfo = '';
    if (Object.keys(req.query).length > 0) {
      extraInfo += ` | Q: ${JSON.stringify(req.query)}`;
    }
    
    // Log the single line
    const logLine = `[SERVER] ${timestamp} | ${statusIcon} ${status} | ${duration.toString().padStart(4)}ms | ${req.method.padEnd(6)} ${req.path}${extraInfo}`;
    console.log(logLine);
    logToFile(logLine);

    if (status >= 400 && res.locals?.responseBody) {
      const errorLog = `[SERVER]      ❌ Error: ${JSON.stringify(res.locals.responseBody)}`;
      console.log(errorLog);
      logToFile(errorLog);
    }
  });

  next();
});

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/', require('./routes/habits'));
app.use('/', require('./routes/vlogs'));
app.use('/', require('./routes/tasks'));
app.use('/', require('./routes/diary'));
app.use('/', require('./routes/next'));
app.use('/', require('./routes/lists'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`[SERVER] 🚀 API running on http://0.0.0.0:${PORT}`);
  console.log(`[SERVER] 🐘 Connected to CockroachDB`);
  console.log(`[SERVER] 📝 Verbose logging enabled`);
  console.log('='.repeat(60) + '\n');
});
