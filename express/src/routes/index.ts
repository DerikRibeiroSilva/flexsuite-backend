import { Router } from 'express';
import customerCompanyRoutes from './customer-company';
import authRoutes from './auth';
import employeeRoutes from './employee';
import userRoutes from './user';
const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/v1/customer-companies', customerCompanyRoutes);
router.use('/api/v1/employees', employeeRoutes);
router.use('/api/v1/users', userRoutes);
export default router;