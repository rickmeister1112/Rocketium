import { Router } from 'express';

import authRoutes from './authRoutes';
import designRoutes from './designRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/designs', designRoutes);

export default router;

