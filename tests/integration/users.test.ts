import app, { init } from '@/app';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { prisma } from '@/config';
import { duplicatedEmailError } from '@/services/users-service';
import { faker } from '@faker-js/faker';
import { cleanDb } from '../helpers';
import { createUser } from '../factories/user-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('POST /users/signup', () => {
  it('should respond with status 400 when body is not given', async () => {
    const response = await server.post('/users/signup');

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 400 when body is not valid', async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

    const response = await server.post('/users/signup').send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe('when body is valid', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(12),
    });

    describe('when the token is valid', () => {
      it('should respond with status 409 when there is an user with given email', async () => {
        const body = generateValidBody();
        await createUser(body);

        const response = await server.post('/users/signup').send(body);

        expect(response.status).toBe(httpStatus.CONFLICT);
        expect(response.body).toEqual(duplicatedEmailError());
      });

      it('should respond with status 201 and create user when given email is unique', async () => {
        const body = generateValidBody();

        const response = await server.post('/users/signup').send(body);

        expect(response.status).toBe(httpStatus.CREATED);
        expect(response.body).toEqual({
          id: expect.any(Number),
          email: body.email,
        });
      });

      it('should not return user password on body', async () => {
        const body = generateValidBody();

        const response = await server.post('/users/signup').send(body);

        expect(response.body).not.toHaveProperty('password');
      });

      it('should save user on db', async () => {
        const body = generateValidBody();

        const response = await server.post('/users/signup').send(body);

        const user = await prisma.user.findUnique({
          where: { email: body.email },
        });
        expect(user).toEqual(
          expect.objectContaining({
            id: response.body.id,
            email: body.email,
          }),
        );
      });
    });
  });
});

describe('POST /users/signin', () => {
  it('should respond with status 400 when body is not given', async () => {
    const response = await server.post('/users/signin');

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 400 when body is not valid', async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

    const response = await server.post('/users/signin').send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe('when body is valid', () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(12),
    });

    it('should respond with status 401 if there is no user for given email', async () => {
      const body = generateValidBody();

      const response = await server.post('/users/signin').send(body);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 400 if there is a user for given email but password is not correct', async () => {
      const body = generateValidBody();
      await createUser(body);

      const response = await server.post('/users/signin').send({
        ...body,
        password: faker.lorem.word(),
      });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when credentials are valid', () => {
      it('should respond with status 200', async () => {
        const body = generateValidBody();
        await createUser(body);

        const response = await server.post('/users/signin').send(body);

        expect(response.status).toBe(httpStatus.OK);
      });

      it('should respond with user data', async () => {
        const body = generateValidBody();
        const user = await createUser(body);

        const response = await server.post('/users/signin').send(body);

        expect(response.body.user).toEqual({
          id: user.id,
          email: user.email,
        });
      });

      it('should respond with session token', async () => {
        const body = generateValidBody();
        await createUser(body);

        const response = await server.post('/users/signin').send(body);

        expect(response.body.token).toBeDefined();
      });
    });
  });
});
