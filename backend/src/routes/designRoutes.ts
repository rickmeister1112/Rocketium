import { Router } from 'express';

import { DesignController } from '../controllers/designController';
import { MongoCommentRepository } from '../repositories/CommentRepository';
import { MongoDesignRepository } from '../repositories/DesignRepository';
import { SocketDesignEventPublisher } from '../realtime/SocketDesignEventPublisher';
import { DesignService } from '../services/DesignService';

const router = Router();

const designRepository = new MongoDesignRepository();
const commentRepository = new MongoCommentRepository();
const eventPublisher = new SocketDesignEventPublisher();
const designService = new DesignService(designRepository, commentRepository, eventPublisher);
const controller = new DesignController(designService);

router.get('/', controller.listDesigns);
router.post('/', controller.createDesign);
router.get('/:id', controller.getDesign);
router.put('/:id', controller.updateDesign);
router.delete('/:id', controller.deleteDesign);

router.get('/:id/comments', controller.listComments);
router.post('/:id/comments', controller.createComment);
router.put('/:id/comments/:commentId', controller.updateComment);

export default router;

