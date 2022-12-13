import faker from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { Network } from '@prisma/client';
import { prisma } from '@/config';

export async function createNetwork(params: Partial<Network> = {}): Promise<Network> {
  const incomingPassword = params.password || faker.internet.password(10);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);
  return prisma.network.create({
    data: {
      title: params.title || faker.lorem.word(2),
      network: params.network || faker.lorem.word(1),
      password: hashedPassword,
      userId: params.userId || faker.datatype.number(),
    },
  });
}
