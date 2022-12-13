import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import networkService from '@/services/networks-service';

export async function getAllNetworks(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  try {
    const networks = await networkService.getAllNetworks(user.id);
    return res.status(httpStatus.OK).send(networks);
  } catch (error) {
    if (error.name === 'notFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.UNAUTHORIZED).send(error);
  }
}

export async function getNetworksById(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const networkId = parseInt(req.params.id);
  if (isNaN(networkId)) {
    res.status(httpStatus.UNPROCESSABLE_ENTITY);
  }
  try {
    const network = await networkService.getNetworkById(user.id, networkId);
    return res.status(httpStatus.OK).send(network);
  } catch (error) {
    if (error.name === 'notFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.UNAUTHORIZED).send(error);
  }
}

export async function createNetwork(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const network = req.body;
  try {
    const newNetwork = await networkService.createNetwork(user, network);
    return res.status(httpStatus.CREATED);
  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
  }
}

export async function deleteNetworks(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const networkId = parseInt(req.params.id);
  if (isNaN(networkId)) {
    res.status(httpStatus.UNPROCESSABLE_ENTITY);
  }
  try {
    await networkService.deleteNetwork(user, networkId);
    return res.status(httpStatus.OK);
  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
  }
}
