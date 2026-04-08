/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;
const ORIGINAL_URI = process.env.MONGODB_URI;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
});

afterAll(async () => {
  await mongoose.disconnect().catch(() => {});
  await mongod.stop();
  process.env.MONGODB_URI = ORIGINAL_URI;
});

describe('connectDB()', () => {
  it('connects to MongoDB and reports readyState 1', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const connectDB = require('@/lib/db').default;
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('does not call mongoose.connect again on a second call (cache hit)', async () => {
    const spy = jest.spyOn(mongoose, 'connect');
    // Same module instance — cached.conn is already set from the previous test
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const connectDB = require('@/lib/db').default;
    await connectDB();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('connectDB() — error handling', () => {
  it('throws when MONGODB_URI is not set', async () => {
    // Disconnect so readyState is 0, then reset the module cache for fresh state
    await mongoose.disconnect().catch(() => {});
    jest.resetModules();
    delete process.env.MONGODB_URI;
    const { default: connectDB } = await import('@/lib/db');
    await expect(connectDB()).rejects.toThrow('MONGODB_URI');
  });
});
