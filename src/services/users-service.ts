import { notFoundError, unauthorizedError } from '@/errors';
import userRepository from '@/repositories/users-repository';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { duplicatedEmailError } from './errors';

export async function createUser({ email, password }: CreateUserParams): Promise<User> {
  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);
  return userRepository.createUser({
    email,
    password: hashedPassword,
  });
}

async function validateUniqueEmailOrFail(email: string) {
  const userWithSameEmail = await userRepository.findUserByEmail(email);
  if (userWithSameEmail) {
    throw duplicatedEmailError();
  }
}

export async function findById(id: number) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw notFoundError();
  }
  return user;
}

export async function getUser(login: CreateUserParams) {
  const user = await userRepository.findUserByEmail(login.email);
  if (!user) {
    throw unauthorizedError();
  }

  const isPasswordCorrect = bcrypt.compareSync(login.password, user.password);
  if (!isPasswordCorrect) {
    throw unauthorizedError();
  }
  return user;
}

export async function login(login: CreateUserParams) {
  const user = await getUser(login);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  return token;
}

export type CreateUserParams = Pick<User, 'email' | 'password'>;

const userService = {
  createUser,
  getUser,
  login,
  findById,
};

export * from './errors';
export default userService;
