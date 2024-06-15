const express = require('express');
const db = require('./database');
const authMiddleware = require('./authMiddleware'); // 引入authMiddleware

const router = express.Router();

// 获取用户列表
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// 获取单条消息
router.get('/messages/:id', async (req, res) => {
    const messageId = req.params.id;
    try {
        const [message] = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});

// 获取最近的聊天消息列表
router.get('/messages', async (req, res) => {
  try {
      // 查询数据库获取最近的聊天消息，限制为最近5条，按时间降序排列
      const messages = await db.query('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 5');
      res.json(messages);
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
