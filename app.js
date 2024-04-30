import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

export { app };