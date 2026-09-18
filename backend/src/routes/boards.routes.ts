import express from 'express';
import * as boardsController from '../controllers/boards.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.use(auth);

router.get('/', boardsController.getBoards);
router.post('/', boardsController.createBoard);
router.get('/:id', boardsController.getBoard);
router.put('/:id', boardsController.updateBoard);
router.delete('/:id', boardsController.deleteBoard);

export default router;
