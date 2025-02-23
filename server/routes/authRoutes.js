import express from 'express';
import { contactQuery, isAuth, Login, Logout, Register, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', Register);

authRouter.post('/login', Login);

authRouter.post('/logout', Logout);

authRouter.post('/send-verify-otp', userAuth, sendVerifyOTP);

authRouter.post('/verify-account', userAuth, verifyEmail);

authRouter.get('/is-auth', userAuth, isAuth);

authRouter.post('/send-reset-otp', sendResetOTP);

authRouter.post('/reset-password', resetPassword);

authRouter.post('/contact-us', contactQuery);


export default authRouter