import express from 'express';
import cors from 'cors'
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 5000

connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

app.use((req, res, next) => {
  console.log(`${req.url} - ${req.method}`);
  next();
});

// API Endpoints
app.get('/', (req, res) => {
  res.send('API is working with GET');
});

app.post('/', (req, res) => {
  res.send('API is working with POST');
});

app.use('/api/auth', authRouter);

app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`Server at ${port}`);
});