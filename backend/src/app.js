import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dataRoutes from './routes/dataRoutes.js';
import hmpiRoutes from './routes/hmpiRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/data', dataRoutes);
app.use('/api/hmpi', hmpiRoutes);
app.use('/api/export', exportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
