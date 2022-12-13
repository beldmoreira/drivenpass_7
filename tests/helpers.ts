import { prisma } from '@/config';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

import { createUser } from './factories/user-factory';
import { createSession } from './factories/session-factory';

export async function cleanDb() {
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.network.deleteMany({});
  await prisma.credential.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}
