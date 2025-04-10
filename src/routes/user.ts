import { Router } from 'express';
import { userController } from '../controllers/user';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, userController.getAll);
router.get('/:id', requireAdmin, userController.getById);
router.post('/', requireAdmin, userController.create);
router.put('/:id', requireAdmin, userController.update);
router.delete('/:id', requireAdmin, userController.delete);

export default router; 