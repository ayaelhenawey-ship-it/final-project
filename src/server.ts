// hello test yassa

import dotenv from 'dotenv';
dotenv.config();

console.log("👀 GOOGLE_CLIENT_ID IS:", process.env.GOOGLE_CLIENT_ID);
console.log("👀 GOOGLE_CLIENT_SECRET IS:", process.env.GOOGLE_CLIENT_SECRET);

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import './config/passport';

import authRoutes from './routes/authRoutes'; 
import apiRoutes from './routes'; 
import { notFound, errorHandler } from './middlewares/errorHandler';

import http from 'http'; 
import { Server } from 'socket.io'; 
import Call from './models/Call'; 

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = '/api/v1';

// ==========================================
// 🛡️ الميدلويرز الأساسية (CORS & JSON) - مكانها الصح هنا
// ==========================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(express.json());

// ==========================================
// 🔌 تغليف السيرفر وتهيئة Socket.io (السنترال)
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

export const userSocketMap = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`🟢 A new device connected to the switchboard, line number: ${socket.id}`);

  socket.on('register-user', (userId: string) => {
    userSocketMap.set(userId, socket.id);
    console.log(`✅ The user [${userId}] Connected to the socket line [${socket.id}]`);
  });

  socket.on('call-user', async (data: { userToCall: string, signalData: any, from: string, callerName: string }) => {
    console.log("🚨 The server received an event call-user Successfully! And the data is:", data);
    try {
      const newCall = await Call.create({
        caller: data.from,      
        receiver: data.userToCall, 
        type: 'video',
        status: 'missed' 
      });

      const receiverSocketId = userSocketMap.get(data.userToCall);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          signal: data.signalData,
          from: data.from,
          callerName: data.callerName,
          callId: newCall._id 
        });
        console.log(`📞 A ringtone from [${data.from}] to [${data.userToCall}] - Registered`);
      } else {
        socket.emit('user-offline', { message: 'The user is currently offline' });
      }
    } catch (error) {
      console.log("Error saving call:", error);
    }
  });

  socket.on('answer-call', async (data: { to: string, signal: any, callId: string }) => {
    try {
      if (data.callId) {
        await Call.findByIdAndUpdate(data.callId, { status: 'accepted' });
      }
      const callerSocketId = userSocketMap.get(data.to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', data.signal);
        console.log(`✅ The call was opened with [${data.to}] - The status has been updated`);
      }
    } catch (error) {
      console.log("Error updating call:", error);
    }
  });

  socket.on('end-call', (data: { to: string }) => {
    const receiverSocketId = userSocketMap.get(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-ended');
      console.log(`🚫 Line lock device: [${data.to}]`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Line disconnected: ${socket.id}`);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// ==========================================
// 🛡️ إعدادات الحماية (Rate Limiting)
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { 
    status: 'error',
    message: "The allowed request limit has been exceeded, please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(BASE_URL, apiLimiter); 

// ==========================================
// 🔑 تهيئة المصادقة عبر Passport
// ==========================================
app.use(passport.initialize());

// ==========================================
// 🗄️ الاتصال بقاعدة البيانات
// ==========================================
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => { 
    console.log('✅ MongoDB Connected');
    console.log('📂 Writing to Database:', mongoose.connection.name);
  })
  .catch(err => console.log('❌ Database Connection Error:', err));

// ==========================================
// 🚀 ربط المسارات بالسيرفر
// ==========================================
app.get('/test', (req: Request, res: Response) => {
  res.send('Server is running');
});

app.use(`${BASE_URL}/auth`, authRoutes);
app.use(BASE_URL, apiRoutes);

// ==========================================
// 🚨 حراس معالجة الأخطاء (Global Error Handlers)
// ==========================================
// دول كفاية جداً ومكانهم هنا صح 100% (في أخر المسارات وقبل تشغيل السيرفر)
app.use(notFound);
app.use(errorHandler);

// ==========================================
// 🌐 تشغيل السيرفر
// ==========================================
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
  console.log(`🔌 Socket.io Central is ready!`);
});