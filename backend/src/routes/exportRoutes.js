import { Router } from 'express';
import * as exportController from '../controllers/exportController.js';

const router = Router();

router.get('/csv', exportController.exportCSV);
router.get('/pdf', exportController.exportPDF);

export default router;
