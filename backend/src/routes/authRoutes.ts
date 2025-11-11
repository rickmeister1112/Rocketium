import { Router } from 'express';

import { AuthController } from '../controllers/authController';
import { SessionService } from '../services/SessionService';
import { MongoUserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

const sessionService = new SessionService();
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const controller = new AuthController(sessionService, userService);

router.post('/token', controller.createSession);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.patch('/profile', authenticate, controller.updateProfile);

export default router;

