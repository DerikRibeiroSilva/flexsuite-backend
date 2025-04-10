import { Router } from 'express';
import customerCompanyRoutes from './customer-company';
import authRoutes from './auth';
import userRoutes from './user';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/customer-companies', customerCompanyRoutes);
router.use('/api/v1/users', userRoutes);

export default router;