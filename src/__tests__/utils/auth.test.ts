/**
 * @jest-environment node
 */
import bcrypt from 'bcryptjs';
import { connect, disconnect, clearDatabase } from '../helpers/db';

// connectDB is a no-op in tests — the in-memory DB is already connected
jest.mock('@/lib/db', () => jest.fn().mockResolvedValue(undefined));

let authorizeUser: typeof import('@/lib/auth-helpers').authorizeUser;
let User: import('mongoose').Model<any>;

beforeAll(async () => {
  await connect();
  const mod = await import('@/lib/auth-helpers');
  authorizeUser = mod.authorizeUser;
  const userMod = await import('@/models/User');
  User = userMod.default;
});

afterAll(disconnect);
afterEach(clearDatabase);

describe('authorizeUser()', () => {
  it('returns null when the email is not found', async () => {
    const result = await authorizeUser('nobody@example.com', 'anypass');
    expect(result).toBeNull();
  });

  it('returns null when the password is wrong', async () => {
    const hash = await bcrypt.hash('correct', 10);
    await User.create({ name: 'Test', email: 'test@example.com', password: hash, role: 'member' });

    const result = await authorizeUser('test@example.com', 'wrong');
    expect(result).toBeNull();
  });

  it('returns the user object (without password) on valid credentials', async () => {
    const hash = await bcrypt.hash('secret', 10);
    await User.create({ name: 'Alice', email: 'alice@example.com', password: hash, role: 'admin' });

    const result = await authorizeUser('alice@example.com', 'secret');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Alice');
    expect(result?.email).toBe('alice@example.com');
    expect(result?.role).toBe('admin');
    expect(result).not.toHaveProperty('password');
  });

  it('returns member role correctly', async () => {
    const hash = await bcrypt.hash('pass', 10);
    await User.create({ name: 'Bob', email: 'bob@example.com', password: hash, role: 'member' });

    const result = await authorizeUser('bob@example.com', 'pass');
    expect(result?.role).toBe('member');
  });

  it('includes a string id field', async () => {
    const hash = await bcrypt.hash('pass', 10);
    await User.create({ name: 'Carol', email: 'carol@example.com', password: hash, role: 'member' });

    const result = await authorizeUser('carol@example.com', 'pass');
    expect(typeof result?.id).toBe('string');
    expect(result?.id.length).toBeGreaterThan(0);
  });
});
