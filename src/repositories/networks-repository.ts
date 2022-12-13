import { prisma } from '@/config';
import { Network } from '@prisma/client';

async function createNetwork(userId: number, network: CreateNetworkData) {
  return prisma.network.create({
    data: { ...network, userId },
  });
}

async function getAllNetworks(userId: number) {
  return prisma.network.findMany({
    where: { userId },
  });
}

async function getNetworksByTitle(userId: number, title: string) {
  return prisma.network.findFirst({
    where: { userId, title },
  });
}

export async function getNetworkById(userId: number, networkId: number) {
  return prisma.network.findFirst({
    where: {
      userId,
      id: networkId,
    },
  });
}

async function deleteNetwork(id: number) {
  return prisma.network.delete({
    where: { id },
  });
}

export type CreateNetworkData = Omit<Network, 'id'>;
const networkRepository = {
  createNetwork,
  getAllNetworks,
  getNetworksByTitle,
  deleteNetwork,
  getNetworkById,
};

export default networkRepository;
