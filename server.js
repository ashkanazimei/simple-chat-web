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
  
  // اگر چت پر باشد
  if (users.length >= 2) {
    socket.emit('chatFull');
    socket.disconnect();
    return;
  }
  
  // اضافه کردن کاربر
  const userNumber = users.length + 1;
  users.push(socket.id);
  
  socket.emit('userConnected', { userNumber: userNumber });
  
  // اگر دو کاربر آنلاین شدند
  if (users.length === 2) {
    io.emit('bothUsersOnline');
  }
  
  // دریافت پیام
  socket.on('sendMessage', (message) => {
    io.emit('newMessage', {
      text: message,
      timestamp: new Date().toLocaleTimeString('fa-IR')
    });
  });
  
  // قطع ارتباط
  socket.on('disconnect', () => {
    users = users.filter(user => user !== socket.id);
    io.emit('userDisconnected');
  });
});

// شروع سرور - مهم: برای Render از process.env.PORT استفاده کنید
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 سرور اجرا شد روی پورت ${PORT}`);
});