import { Router } from 'express';
import customerCompanyRoutes from './customer-company';
import authRoutes from './auth';
import employeeRoutes from './employee';
const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/v1/customer-companies', customerCompanyRoutes);
router.use('/api/v1/employees', employeeRoutes);
export default router;