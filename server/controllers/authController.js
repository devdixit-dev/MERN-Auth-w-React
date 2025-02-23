import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const Register = async (req, res) => {
  // get info from use
  const { name, email, password } = req.body;
  // check if anything is missing or unfilled
  if (!name || !email || !password) {
    // if send this
    return res.json({
      success: false,
      message: 'details are missing'
    });

  }
  // if not run try block
  try {
    // check user already exist or not by unique email
    const existingUser = await User.findOne({ email });
    // if exist then send this
    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exist'
      });
    }
    // if not hash the password for security reasons
    const hashedPassword = await bcrypt.hash(password, 10);
    // store user in User model
    const user = await User.create({ name, email, password: hashedPassword });
    // generate token for login verification
    const token = jwt.sign(
      { id: user._id }, // store unique id from database
      process.env.JWT_SECRET, // use secret key
      { expiresIn: '7d' } // auto-expiry in 7 days
    );
    // store token in cookie for session management
    res.cookie('token', token, { // store above token as a 'token'
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // if its not production then show false
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // if its production then show none, else show strict
      maxAge: 7 * 24 * 60 * 60 * 1000 // maxage of this cookie is 7 days count like 7 * hours * minutes * seconds * milsec
    });

    // sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to MERN Auth',
      text: `Welcome to mern auth website. Your account has been created with email id: ${email}`
    }

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });

  }
  catch (error) {
    // if error occurs
    res.json({
      success: false,
      message: error.message
    });
  }
}

export const Login = async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {

    return res.json({
      success: false,
      message: 'Email and Password are missing'
    });

  }

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid email'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      { id: user._id }, // store unique id from database
      process.env.JWT_SECRET, // use secret key
      { expiresIn: '7d' } // auto-expiry in 7 days
    );

    res.cookie('token', token, { // store above token as a 'token'
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // if its not production then show false
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // if its production then show none, else show strict
      maxAge: 7 * 24 * 60 * 60 * 1000 // maxage of this cookie is 7 days count like 7 * hours * minutes * seconds * milsec
    });

    return res.json({
      success: true,
      message: "User logged in"
    });

  }
  catch (error) {
    // if error occurs
    res.json({
      success: false,
      message: error.message
    });
  }

}

export const Logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // if its not production then show false
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // if its production then show none, else show strict
    });

    return res.json({
      success: true,
      message: 'Logged Out'
    })
  }
  catch (error) {
    // if error occurs
    res.json({
      success: false,
      message: error.message
    });
  }
}

// send verification OTP to the user's email
export const sendVerifyOTP = async (req, res) => {

  try {
    // get the id from body
    const { userId } = req.body;
    // serach user by id
    const user = await User.findById(userId);
    // check is account is verified before or not if yes then send this
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: 'Account is already verified'
      });
    }
    // else run this
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // make 6 digit otp
    user.verifyOTP = otp; // save otp in db as verify OTP
    user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours is the max age of this otp

    await user.save(); // save this above data into db
    // now we can send the email to user
    const mailOption = {
      from: process.env.SENDER_EMAIL, // senders email id, my email
      to: user.email, // receivers email id, user email
      subject: 'Account Verification OTP', // sub
      text: `Your OTP is ${otp}. Verify your account using this OTP.` // body of the email
    }

    await transporter.sendMail(mailOption); // send the email with the help of transporter function that having the configuration with our mailing server
    // after the sending email send this
    res.json({
      success: true,
      message: "Verification OTP sent on Email"
    })

  }
  catch (error) {

    // if error occurs
    res.json({
      success: false,
      message: error.message
    });

  }

}

// verify the otp
export const verifyEmail = async (req, res) => {
  // verify id and otp from body
  const { userId, otp } = req.body;
  // if any one is not available send this
  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Missing details"
    });
  }
  // else run this
  try {
    // find user by id
    const user = await User.findById(userId);
    // if not found, then send this
    if (!user) {

      return res.json({
        success: false,
        message: "User not found"
      });

    }
    // if user's verification OTP is blank in db or does not matches with user entered otp in the body
    if (user.verifyOTP === '' || user.verifyOTP !== otp) {
      // send this
      return res.json({
        success: false,
        message: "Invalid OTP"
      });

    }
    // if user's otp is expired before this time
    if (user.verifyOTPExpireAt < Date.now()) {
      // send this
      return res.json({
        success: false,
        message: "OTP expired"
      });

    }
    // else add this in db
    user.isAccountVerified = true; // user's account is now verified cause user entered otp and we sent otp are matching // true
    user.verifyOTP = ''; // empty the user's verification otp cause we dont need to filled otp in there
    user.verifyOTPExpireAt = 0; // add 0 as time, cause we dont need to expiry any otp // user now verified

    await user.save(); // save above details in db
    // after the verification, send this
    return res.json({
      success: true,
      message: "Email verified successfully"
    });

  }
  catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

}

// check user logged in or not with userAuth ?
export const isAuth = async (req, res) => {

  try {
    // just run userAuth middleware and if userAuth is verify user, then send this to user
    return res.json({ success: true });

  }
  catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }

}

// send password reset OTP
export const sendResetOTP = async (req, res) => {
  // get the email for sending the reset password otp
  const { email } = req.body;
  // if email is blank, then send this
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required"
    });
  }
  // else run this
  try {
    // find user by user entered email in the body
    const user = await User.findOne({ email });
    // if not found, send this
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      })
    }
    // if found
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // make otp, 6 digit, string

    user.resetOTP = otp; // add otp in the user's reset OTP field in db
    user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000 // 15 minutes is the otp expiry time from this time, add expiry time in the db

    await user.save(); // save above details in the db
    // send the email
    const mailOption = {
      from: process.env.SENDER_EMAIL, // senders email, my email
      to: user.email, // user's email
      subject: 'Password Reset OTP', // sub
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.` // body text email
    }

    await transporter.sendMail(mailOption); // send with the help of transporter function
    // after sending the mail, send this to user
    return res.json({
      success: true,
      message: "OTP sent to your email"
    })

  }
  catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }
}

// reset user password
export const resetPassword = async (req, res) => {
  // get the data email, otp and new password from req body
  const { email, otp, newPassword } = req.body;
  // if any field is blank, then send this
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required"
    })
  }

  try {
    // find the user by email
    const user = await User.findOne({ email });
    // if user not found, send this
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      })
    }
    // if user's otp field in db is empty or not matches with user entered otp in req body then send this
    if (user.resetOTP === "" || user.resetOTP !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      })
    }
    // if user's otp is expired before this time, send this
    if (user.resetOTPExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired"
      })
    }
    // else run - user is found and verified
    const encryptPassword = await bcrypt.hash(newPassword, 10); // encrypt the new password
    user.password = encryptPassword; // change the user's old password to new encrypted password
    user.resetOTP = ""; // make user's reset otp empty, for user use this feature again to set a new password
    user.resetOTPExpireAt = 0; // make otp expiry 0

    await user.save(); // save above details in the db
    // after reset the password, send this
    return res.json({
      success: true,
      message: "Password has been reset successfully"
    })

  }
  catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

}

// contact us logic
export const contactQuery = async (req, res) => {

  const { email, comment } = req.body;

  if (!email || !comment) {
    return res.json({
      success: false,
      message: "All fields are required to send the query."
    })
  }

  try {
    // sending email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'IMP: User Query',
      text: `Hello, admin.\nWe received a query from ${email}\n${comment}`
    }

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Your query has been submitted, we assist you shortly."
    });

  }

  catch (error) {

    return res.json({
      success: false,
      message: error.message
    });

  }

}