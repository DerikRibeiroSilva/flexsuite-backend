import { Router } from 'express';
import { employeeController } from '../controllers/employee';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);

export default router; 