import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUsersByTeam,
  createUser,
  updateUser,
  deleteUser,
  getUserScores,
} from '../controllers/userController';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/team/:teamId', getUsersByTeam);
router.get('/:id/scores', getUserScores);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
