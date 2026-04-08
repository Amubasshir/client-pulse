/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { connect, disconnect, clearDatabase } from '../helpers/db';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearDatabase);

// Import AFTER db connect so Mongoose registers the model once
let User: mongoose.Model<any>;

beforeAll(async () => {
  // Dynamic import avoids "model already registered" errors in watch mode
  const mod = await import('@/models/User');
  User = mod.default;
});

describe('User model', () => {
  it('saves a valid admin user', async () => {
    const user = new User({
      name: 'Mubasshir',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin',
    });
    const saved = await user.save();
    expect(saved._id).toBeDefined();
    expect(saved.email).toBe('test@example.com');
    expect(saved.role).toBe('admin');
  });

  it('saves a valid member user with default role', async () => {
    const user = new User({
      name: 'Ashik',
      email: 'ashik@example.com',
      password: 'hashedpassword',
    });
    const saved = await user.save();
    expect(saved.role).toBe('member');
  });

  it('fails when name is missing', async () => {
    const user = new User({ email: 'x@x.com', password: 'pass' });
    await expect(user.save()).rejects.toThrow(/name/i);
  });

  it('fails when email is missing', async () => {
    const user = new User({ name: 'Test', password: 'pass' });
    await expect(user.save()).rejects.toThrow(/email/i);
  });

  it('fails when password is missing', async () => {
    const user = new User({ name: 'Test', email: 'x@x.com' });
    await expect(user.save()).rejects.toThrow(/password/i);
  });

  it('fails with an invalid role', async () => {
    const user = new User({
      name: 'Test',
      email: 'x@x.com',
      password: 'pass',
      role: 'superadmin',
    });
    await expect(user.save()).rejects.toThrow(/role/i);
  });

  it('enforces unique email', async () => {
    await new User({ name: 'A', email: 'dup@x.com', password: 'p' }).save();
    const dup = new User({ name: 'B', email: 'dup@x.com', password: 'p' });
    await expect(dup.save()).rejects.toThrow();
  });

  it('stores createdAt and updatedAt timestamps', async () => {
    const user = await new User({
      name: 'T',
      email: 't@t.com',
      password: 'p',
    }).save();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
