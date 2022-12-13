import app, { init } from '@/app';
import supertest from 'supertest';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { cleanDb } from '../helpers';
import { createCredential } from '../factories/credential-factory';
import { generateValidToken } from '../helpers';
import { createUser } from '../factories/user-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /credentials', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/credentials/');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/credentials/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = await generateValidToken();

    const response = await server.get('/credentials/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 401 when there is no credential for given user', async () => {
      const token = await generateValidToken();

      const response = await server.get('/credentials/').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 200 and credential data with address when there is a credential for given user', async () => {
      const user = await createUser;
      const token = await generateValidToken();
      const credential = await createCredential();
      const response = await server.get('/credentials/').set('authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toBeDefined();
    });
  });
});

describe('GET /credentials/:id', () => {
  it('should respond with status 200 when id is valid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createCredential();
    const response = await server.get(`/credentials/1`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toBeDefined();
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/credentials/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('POST /credentials', () => {
  const generateValidBody = () => ({
    title: faker.lorem.word(2),
    url: faker.internet.url(),
    username: faker.internet.userName(),
    password: faker.internet.password(12),
  });

  it('should respond with status 401 if no token is given', async () => {
    const credential = {
      title: faker.lorem.word(),
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };

    const response = await server.post('/credentials/').send(credential);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/credentials/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/credentials/').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not present', async () => {
      const token = await generateValidToken();

      const response = await server.post('/credentials/').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/credentials/').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when body is valid', () => {
      const generateValidBody = () => ({
        title: faker.lorem.word(2),
        url: faker.internet.url(),
        username: faker.internet.userName(),
        password: faker.internet.password(12),
      });

      it('should respond with status 201 and create new credential if there is not any', async () => {
        const user = await createUser();
        const token = await generateValidToken();
        const credentialBody = generateValidBody();
        const response = await server
          .post('/credentials/')
          .set('Authorization', `Bearer ${token}`)
          .send(credentialBody);

        expect(response.status).toBe(httpStatus.CREATED);
      });
    });

    describe('when body is invalid', () => {
      const generateInvalidBody = () => ({
        title: faker.lorem.word(2),
        url: faker.internet.url(),
        username: faker.internet.userName(),
        password: faker.internet.password(2),
      });

      it('should respond with status 500 when the body is invalid', async () => {
        const body = generateInvalidBody();
        const token = await generateValidToken();
        const response = await server.post('/credentials/').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      });

      it('should return with status 409 when title already exists', async () => {
        const token = await generateValidToken();
        const title = faker.lorem.word();
        await createCredential();
        const body = {
          title,
          url: faker.internet.url(),
          username: faker.internet.userName(),
          password: faker.internet.password(),
        };
        const result = await server.post('/credentials/').set('authorization', `Bearer ${token}`).send(body);
        expect(result.status).toEqual(httpStatus.CONFLICT);
      });
    });
  });
});

describe('DELETE /credentials/:id', () => {
  it('should return status 401 when token is not given', async () => {
    const token = await generateValidToken();
    const result = await server.delete('/credentials/1');

    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 200', async () => {
    const token = await generateValidToken();
    const credential = await createCredential();
    const result = await server.delete(`/credentials/${credential.id}`).set('authorization', `Bearer ${token}`);

    expect(result.status).toEqual(httpStatus.OK);
  });
});
