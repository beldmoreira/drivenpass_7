import { prisma } from '@/config';
import { User } from '@prisma/client';

async function createUser(data: CreateUserParams) {
  return prisma.user.create({
    data,
  });
}

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function findById(userId: number) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

const userRepository = {
  findUserByEmail,
  createUser,
  findById,
};

export type CreateUserParams = Omit<User, 'id'>;

export default userRepository;
