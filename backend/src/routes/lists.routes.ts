import express from 'express';
import * as listsController from '../controllers/lists.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.use(auth);

router.post('/', listsController.createList);
router.put('/:id', listsController.updateList);
router.delete('/:id', listsController.deleteList);

export default router;
