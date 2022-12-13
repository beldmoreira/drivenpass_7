import faker from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { Credential } from '@prisma/client';
import { prisma } from '@/config';

export async function createCredential(params: Partial<Credential> = {}): Promise<Credential> {
  const incomingPassword = params.password || faker.internet.password(10);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);
  return prisma.credential.create({
    data: {
      userId: params.userId || faker.datatype.number(),
      title: params.title || faker.lorem.word(),
      url: params.url || faker.internet.url(),
      username: params.username || faker.internet.userName(),
      password: hashedPassword,
    },
  });
}
