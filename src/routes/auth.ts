import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Rotas protegidas (requerem autenticação)
router.post('/customer-company', authenticate, authController.registerCompany);
router.post('/user', authenticate, authController.registerUser);
router.post('/change-password', authenticate, authController.changePassword);

export default router; 