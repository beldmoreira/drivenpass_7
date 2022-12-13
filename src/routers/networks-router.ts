import { Router } from 'express';
import { createNetworkSchema } from '@/schemas';
import { validateBody, authenticateToken } from '@/middlewares';
import { createNetwork, deleteNetworks, getAllNetworks, getNetworksById } from '@/controllers';

const networksRouter = Router();

networksRouter
  .all('/*', authenticateToken)
  .get('/', getAllNetworks)
  .get('/:id', getNetworksById)
  .post('/', validateBody(createNetworkSchema), createNetwork)
  .delete('/:id', deleteNetworks);

export { networksRouter };
