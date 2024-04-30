import { app } from './app.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import generateToken from './utils/generateToken.js';
import asyncHandler from 'express-async-handler';

dotenv.config();
const PORT = process.env.PORT || 3000;


app.post('/api/sign-out', asyncHandler(async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).send('Logged out successfully');
}));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

// Start the server
app.listen(PORT, () => {  
  console.log(`Server is running on http://localhost:${PORT}`);
})  
