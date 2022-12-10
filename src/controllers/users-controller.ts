import userService from '@/services/users-service';
import { notFoundError } from '@/errors';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

export async function signUp(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await userService.createUser({ email, password });
    return res.status(httpStatus.CREATED).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    if (error.name === 'DuplicatedEmailError') {
      return res.status(httpStatus.CONFLICT).send(error);
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}

export async function signIn(req: Request, res: Response) {
  const user = req.body;
  try {
    const token = await userService.login(user);
    return res.status(httpStatus.OK).send({ token });
  } catch (error) {
    if (error.name === 'notFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}
