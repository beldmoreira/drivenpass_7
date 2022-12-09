import { prisma } from '@/config';

export async function cleanDb() {
  await prisma.user.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.network.deleteMany({});
}
