const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// سرویس فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public')));

// مدیریت کاربران
let users = [];

io.on('connection', (socket) => {
  console.log('✅ کاربر جدید متصل شد');
  
  if (users.length >= 2) {
    socket.emit('chatFull');
    socket.disconnect();
    return;
  }
  
  const userNumber = users.length + 1;
  users.push(socket.id);
  
  socket.emit('userConnected', { userNumber: userNumber });
  
  if (users.length === 2) {
    io.emit('bothUsersOnline');
  }
  
  // دریافت پیام - اینجا مشکل بود
  socket.on('sendMessage', (messageText) => {
    const user = users.findIndex(u => u === socket.id) + 1;
    
    // ارسال پیام به صورت متن ساده
    io.emit('newMessage', {
      text: messageText, // مستقیماً متن را بفرست
      userNumber: user,
      timestamp: new Date().toLocaleTimeString('fa-IR')
    });
  });
  
  socket.on('disconnect', () => {
    users = users.filter(user => user !== socket.id);
    io.emit('userDisconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 سرور اجرا شد روی پورت ${PORT}`);
});
