import { Router } from 'express';
import multer from 'multer';
import * as dataController from '../controllers/dataController.js';
import { validateRecord } from '../middleware/validate.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/', validateRecord, dataController.createData);
router.post('/upload', upload.single('file'), dataController.uploadFile);
router.get('/', dataController.getAllData);
router.get('/:id', dataController.getDataById);

export default router;
