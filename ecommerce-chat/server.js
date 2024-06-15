const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./auth');
const authMiddleware = require('./authMiddleware');
const db = require('./database');

// 初始化Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 中间件
app.use(bodyParser.json());
app.use('/auth', authRoutes);

// 静态文件
app.use(express.static('public'));

// Socket.io连接事件
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('a user connected:', socket.user.username);

    // 监听并处理消息事件
    socket.on('chat message', async (msg) => {
        const { receiver_id, message } = msg;
        try {
            // 在此处添加数据库操作，将消息存入数据库
            await db.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [socket.user.id, receiver_id, message]);
            io.emit('chat message', { sender_id: socket.user.id, receiver_id, message, username: socket.user.username });
        } catch (error) {
            console.error('Error while saving message to database:', error.message);
        }
    });

    // 监听用户断开连接
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.user.username);
    });
});

// 服务器监听端口
server.listen(3000, () => {
    console.log('listening on *:3000');
});
