import { Router } from 'express';
import * as hmpiController from '../controllers/hmpiController.js';

const router = Router();

router.get('/:id', hmpiController.getHMPIByRowContext);

export default router;
