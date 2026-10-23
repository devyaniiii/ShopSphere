
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
  const databaseState = mongoose.connection.readyState;

  const databaseStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[databaseState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    database: databaseStatus
  });
});

module.exports = router;
