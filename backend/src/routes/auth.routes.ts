import express from 'express';
import * as authController from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);

export default router;
