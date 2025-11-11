import { Router } from 'express';

import { DesignController } from '../controllers/designController';
import { MongoCommentRepository } from '../repositories/CommentRepository';
import { MongoDesignRepository } from '../repositories/DesignRepository';
import { SocketDesignEventPublisher } from '../realtime/SocketDesignEventPublisher';
import { DesignService } from '../services/DesignService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

const designRepository = new MongoDesignRepository();
const commentRepository = new MongoCommentRepository();
const eventPublisher = new SocketDesignEventPublisher();
const designService = new DesignService(designRepository, commentRepository, eventPublisher);
const controller = new DesignController(designService);

router.get('/', authenticate, controller.listDesigns);
router.get('/:id', authenticate, controller.getDesign);
router.get('/:id/comments', authenticate, controller.listComments);

router.post('/', authenticate, controller.createDesign);
router.put('/:id', authenticate, controller.updateDesign);
router.delete('/:id', authenticate, controller.deleteDesign);

router.post('/:id/comments', authenticate, controller.createComment);
router.put('/:id/comments/:commentId', authenticate, controller.updateComment);
router.post('/:id/access-requests', authenticate, controller.requestAccess);
router.post('/:id/access-requests/:userId', authenticate, controller.respondToAccessRequest);

export default router;

