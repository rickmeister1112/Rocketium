import { Router } from 'express';

import designRoutes from './designRoutes';

const router = Router();

router.use('/designs', designRoutes);

export default router;

