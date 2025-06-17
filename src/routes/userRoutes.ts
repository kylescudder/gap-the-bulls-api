import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUsersByTeam,
  getUserScores,
  getCurrentUser,
} from '../controllers/userController';

const router = Router();

router.get('/me', getCurrentUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/team/:teamId', getUsersByTeam);
router.get('/:id/scores', getUserScores);

export default router;
