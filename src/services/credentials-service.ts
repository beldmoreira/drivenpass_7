import { conflictError } from '@/errors';
import { notFoundError } from '@/errors';
import { encrypt } from './encrypt';
import { decrypt } from './encrypt';
import { User } from '@prisma/client';
import { CreateCredentialData } from '@/repositories/credentials-repository';
import credentialRepository from '@/repositories/credentials-repository';

async function createCredential(user: User, credential: CreateCredentialData) {
  const isThereCredential = await credentialRepository.getCredentialByTitle(user.id, credential.title);
  if (isThereCredential) throw conflictError('There is already a credential with this title');

  const credentialPassword = credential.password;
  const credentialInfos = { ...credential, password: encrypt(credentialPassword) };

  await credentialRepository.createCredential(user.id, credentialInfos);
}

async function getCredentialById(userId: number, credentialId: number) {
  const credential = await credentialRepository.getCredentialById(userId, credentialId);
  if (!credential) throw notFoundError();

  return {
    ...credential,
    password: decrypt(credential.password),
  };
}

async function getAllCredentials(userId: number) {
  const credentials = await credentialRepository.getAllCredentials(userId);
  return credentials.map((credential) => {
    const { password } = credential;
    return { ...credential, password: decrypt(password) };
  });
}

async function deleteCredentials(user: User, credentialId: number) {
  await getCredentialById(user.id, credentialId);
  await credentialRepository.deleteCredentials(credentialId);
}

const credentialService = {
  createCredential,
  getCredentialById,
  getAllCredentials,
  deleteCredentials,
};

export * from './errors';
export default credentialService;
