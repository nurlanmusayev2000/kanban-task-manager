import express from 'express';
import * as cardsController from '../controllers/cards.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.use(auth);

router.post('/', cardsController.createCard);
router.put('/:id', cardsController.updateCard);
router.delete('/:id', cardsController.deleteCard);
router.post('/:id/comments', cardsController.addComment);

export default router;
