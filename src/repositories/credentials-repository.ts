import { prisma } from '@/config';
import { Credential } from '@prisma/client';

async function createCredential(userId: number, credential: CreateCredentialData) {
  return prisma.credential.create({
    data: { ...credential, userId },
  });
}

async function getCredentialByTitle(userId: number, title: string) {
  return prisma.credential.findFirst({
    where: {
      userId,
      title,
    },
  });
}

async function getCredentialById(userId: number, credentialId: number) {
  return prisma.credential.findFirst({
    where: {
      userId,
      id: credentialId,
    },
  });
}

async function getAllCredentials(userId: number) {
  return prisma.credential.findMany({
    where: { userId },
  });
}

async function deleteCredentials(id: number) {
  return prisma.credential.delete({
    where: { id },
  });
}

const credentialRepository = {
  createCredential,
  getCredentialByTitle,
  getAllCredentials,
  deleteCredentials,
  getCredentialById,
};

export type CreateCredentialData = Omit<Credential, 'id'>;

export default credentialRepository;
