import { Router } from 'express';

import { createUserSchema } from '@/schemas';
import { validateBody } from '@/middlewares';
import { signIn, signUp } from '@/controllers';

const usersRouter = Router();

usersRouter

  .post('/signup', validateBody(createUserSchema), signUp)
  .post('/signin', validateBody(createUserSchema), signIn);

export { usersRouter };
