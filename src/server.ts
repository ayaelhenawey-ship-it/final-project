import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import User from './models/user';
import Chat from './models/chat';
import Message from './models/Message';
import Post from './models/Post';
import Job from './models/Job';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = '/api/v1';


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, // أقصى عدد طلبات مسموح بيها لكل يوزر (IP) في الـ 15 دقيقة دي
  message: { 
    message:"The allowed request limit has been exceeded, please try again after 15 minutes." 
  },
  standardHeaders: true, // بيرجع معلومات الحماية في الـ Headers
  legacyHeaders: false, // بيلغي الـ Headers القديمة عشان الأداء
});

// هنا بنقول للسيرفر: أي رابط بيبدأ بـ /api/v1 طبق عليه الحماية دي
app.use(BASE_URL, apiLimiter); 


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string)
  .then(() =>{ 
    console.log('MongoDB Connected');
  console.log('📂 Writing to Database:', mongoose.connection.name);
})
  .catch(err => console.log(err));

app.get('/test', (req, res) => {
  res.send('Server is running');
});


app.get(`${BASE_URL}/users`, async (req, res) => {
  try {
    const users = await User.find(); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 1. مسار لإضافة مستخدم جديد للتجربة
app.post(`${BASE_URL}/users`, async (req, res) => {
  try {

    const newUser = new User(req.body); 
  
    const savedUser = await newUser.save(); 
    
    
    res.status(201).json(savedUser); 
  } catch (error: any) {
   
    res.status(400).json({ message: error.message });
  }
});

// 2. مسار لإضافة محادثة (Chat)
app.post(`${BASE_URL}/chats`, async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    res.status(201).json(await newChat.save());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// 3. مسار لإضافة وظيفة (Job)
app.post(`${BASE_URL}/jobs`, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    res.status(201).json(await newJob.save());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// 4. مسار لإضافة منشور (Post)
app.post(`${BASE_URL}/posts`, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    res.status(201).json(await newPost.save());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// مسار لإضافة رسالة جديدة (Message)
app.post(`${BASE_URL}/messages`, async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    res.status(201).json(await newMessage.save());
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// مسار التسجيل (Register)
app.post(`${BASE_URL}/auth/register`, async (req, res): Promise<any> => {
  try {
    // 1. بناخد الداتا اللي جاية من الـ Front-end (لاحظي إننا بناخد password عادي مش متشفر لسه)
    const { fullName, email, password, role, trackName } = req.body;

    // 2. نتأكد إن الإيميل ده مش متسجل قبل كده
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "The email is already registered!" });
    }

    // 3. تشفير الباسورد (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. حفظ اليوزر في الداتا بيز بالباسورد المتشفر
    const newUser = new User({
      fullName,
      email,
      passwordHash: hashedPassword, 
      role,
      trackName
    });
    const savedUser = await newUser.save();

    // 5. صناعة الـ Token (الكارت اللي هيكمل بيه في الموقع)
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '7d' } 
    );

    
    res.status(201).json({
      message: "The account has been successfully created",
      token: token,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🚀 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
});