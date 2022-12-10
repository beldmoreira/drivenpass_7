import { CreateNetworkData } from '@/services';
import joi from 'joi';

export const createNetworkSchema = joi.object<CreateNetworkData>({
  title: joi.string().required(),
  network: joi.string().required(),
  password: joi.string().required(),
});
