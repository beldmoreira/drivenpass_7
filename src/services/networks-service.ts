import { notFoundError, unauthorizedError } from '@/errors';
import networkRepository from '@/repositories/networks-repository';
import { decrypt, encrypt } from './encrypt';
import { Network, User } from '@prisma/client';
import { duplicatedTitleError } from './errors';

async function createNetwork(user: User, network: CreateNetworkData) {
  const existingNetwork = await networkRepository.getNetworksByTitle(user.id, network.title);
  if (existingNetwork) throw duplicatedTitleError();
  const networkPassword = network.password;
  const networkInfos = { ...network, password: encrypt(networkPassword) };
  await networkRepository.createNetwork(user.id, networkInfos);
}

async function getNetworkById(userId: number, networkId: number) {
  const existingNetwork = await networkRepository.getNetworkById(userId, networkId);
  if (!existingNetwork) {
    return notFoundError();
  }
  return {
    ...existingNetwork,
    password: decrypt(existingNetwork.password),
  };
}

async function getAllNetworks(userId: number) {
  const networks = await networkRepository.getAllNetworks(userId);
  if (!networks) {
    return notFoundError();
  }
  return networks.map((network) => {
    const { password } = network;
    return { ...network, password: decrypt(password) };
  });
}

async function deleteNetwork(user: User, networkId: number) {
  await getNetworkById(user.id, networkId);
  await networkRepository.deleteNetwork(networkId);
}

const networkService = {
  createNetwork,
  getNetworkById,
  getAllNetworks,
  deleteNetwork,
};

export type CreateNetworkData = Omit<Network, 'id'>;
export * from './errors';
export default networkService;
