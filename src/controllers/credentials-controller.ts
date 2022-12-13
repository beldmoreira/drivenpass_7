import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import credentialService from '@/services/credentials-service';

export async function getAllCredentials(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  try {
    const credentials = await credentialService.getAllCredentials(user.id);
    return res.status(httpStatus.OK).send(credentials);
  } catch (error) {
    if (error.name === 'notFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.UNAUTHORIZED).send(error);
  }
}

export async function getCredentialById(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const credentialId = parseInt(req.params.id);
  if (isNaN(credentialId)) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY);
  }

  if (!credentialId) {
    return res.status(httpStatus.BAD_REQUEST);
  }
  try {
    const credential = await credentialService.getCredentialById(user.id, credentialId);
    return res.status(httpStatus.OK).send(credential);
  } catch (error) {
    if (error.name === 'notFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.UNAUTHORIZED).send(error);
  }
}

export async function createCredential(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const credential = req.body;

  await credentialService.createCredential(user, credential);
  res.sendStatus(201);

  try {
    const newCredential = await credentialService.createCredential(user, credential);
    return res.status(httpStatus.CREATED).send(newCredential);
  } catch (error) {
    if (error.name === 'UnauthorizedError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
  }
}

export async function deleteCredential(req: AuthenticatedRequest, res: Response) {
  const { user } = res.locals;
  const credentialId = parseInt(req.params.id);

  if (isNaN(credentialId)) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY);
  }

  if (credentialId === undefined || credentialId === null) {
    return res.status(httpStatus.BAD_REQUEST);
  }

  try {
    await credentialService.deleteCredentials(user, credentialId);
    return res.status(httpStatus.OK);
  } catch (error) {
    if (error.name === 'UnauthorizedError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
  }
}
