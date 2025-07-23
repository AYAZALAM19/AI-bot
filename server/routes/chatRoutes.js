const express = require('express');
const axios = require('axios');
const { Readable } = require('stream');
const router = express.Router();
const pool = require('../db/index');

// Example route
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching chats:', err.message);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO chats (title) VALUES ($1) RETURNING *',
      [title || 'New Chat']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating chat:', err.message);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

router.post('/:chatId/message', async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Store user message
    await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
      [chatId, 'user', content]
    );

    // Send request to Ollama with streaming
    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'gemma:3b',
        prompt: content,
        stream: true,
      },
      {
        responseType: 'stream',
      }
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let botReply = '';

    // Stream data token-by-token
    ollamaResponse.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        const json = JSON.parse(line);
        if (json.done) {
          res.write(`data: [DONE]\n\n`);
          res.end();

          // Store assistant's full message
          pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [chatId, 'assistant', botReply]
          );
        } else {
          res.write(`data: ${json.response}\n\n`);
          botReply += json.response;
        }
      }
    });

    ollamaResponse.data.on('end', () => {
      if (!res.writableEnded) res.end();
    });

    ollamaResponse.data.on('error', (err) => {
      console.error('Streaming error:', err);
      if (!res.writableEnded) {
        res.status(500).json({ error: 'Error during streaming' });
      }
    });

  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;