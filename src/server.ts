import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import User from './models/users';
import Chat from './models/chats';
import Message from './models/Message';
import Post from './models/Post';
import Job from './models/Job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const BASE_URL = '/api/v1';

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB Connected'))
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🚀 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
});