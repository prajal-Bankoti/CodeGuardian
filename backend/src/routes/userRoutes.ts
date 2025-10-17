import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;
