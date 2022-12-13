import { Router } from 'express';
import { validateBody, authenticateToken } from '@/middlewares';
import { createCredentialSchema } from '@/schemas';
import { createCredential, deleteCredential, getAllCredentials, getCredentialById } from '@/controllers';

const credentialsRouter = Router();

credentialsRouter
  .all('/*', authenticateToken)
  .get('/', getAllCredentials)
  .get('/:id', getCredentialById)
  .post('/', validateBody(createCredentialSchema), createCredential)
  .delete('/:id', deleteCredential);

export { credentialsRouter };
