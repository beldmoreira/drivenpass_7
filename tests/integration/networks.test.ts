import app, { init } from '@/app';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { prisma } from '@/config';
import { faker } from '@faker-js/faker';
import { cleanDb } from '../helpers';
import { generateValidToken } from '../helpers';
import { createUser } from '../factories/user-factory';
import { createNetwork } from '../factories/network-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /networks', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/networks/');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/networks/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = await generateValidToken();
    const response = await server.get('/networks/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 401 when there is no network for given user', async () => {
      const token = await generateValidToken();

      const response = await server.get('/networks/').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 200 and network data with address when there is a network for given user', async () => {
      const user = createUser();
      const token = await generateValidToken();
      const network = await createNetwork();
      const response = await server.get('/networks/').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: network.id,
        title: network.title,
        network: network.network,
        password: network.password,
        userId: network.userId,
      });
    });
  });
});

describe('GET /networks/:id', () => {
  it('should respond with status 200 when id is valid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const network = await createNetwork();
    const response = await server.get(`/networks/${network.id}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toBeDefined();
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/networks/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('POST /networks', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/networks/');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 400 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = await generateValidToken();

    const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not present', async () => {
      const token = await generateValidToken();

      const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when body is valid', () => {
      const generateValidBody = () => ({
        title: faker.lorem.word(2),
        network: faker.lorem.word(1),
        password: faker.internet.password(12),
      });

      it('should respond with status 201 and create new network if there is not any', async () => {
        const user = await createUser();
        const body = await generateValidBody();
        const token = await generateValidToken(user);

        const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.OK);
        const network = await prisma.network.findFirst({ where: { title: body.title } });
        expect(network).toBeDefined();
      });
    });

    describe('when body is invalid', () => {
      const generateInvalidBody = () => ({
        username: faker.internet.userName(),
        password: faker.internet.password(2),
      });

      it('should respond with status 400 when the body is invalid', async () => {
        const body = generateInvalidBody();
        const token = await generateValidToken();

        const response = await server.post('/networks/').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });
    });
  });
});

describe('DELETE /networks/:id', () => {
  it('should return null and delete the network when the id is available', async () => {
    const token = await generateValidToken();
    const response = await server.delete('/networks/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response).toBe(null);
  });

  it('should return status 401 when token is not given', async () => {
    const token = await generateValidToken();
    const result = await server.delete('/networks/1');

    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });
});
