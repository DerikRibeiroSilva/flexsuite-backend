import { Router } from 'express';
import { customerCompanyController } from '../controllers/customer-company';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, customerCompanyController.getAll);
router.get('/:id', requireAdmin, customerCompanyController.getById);
router.post('/', requireAdmin, customerCompanyController.create);
router.put('/:id', requireAdmin, customerCompanyController.update);
router.delete('/:id', requireAdmin, customerCompanyController.delete);

export default router;