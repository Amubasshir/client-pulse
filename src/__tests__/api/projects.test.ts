/**
 * @jest-environment node
 *
 * This file manages its own MongoMemoryServer lifecycle so that jest.mock()
 * hoisting does not interfere with the shared helpers/db.ts teardown.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────
jest.mock('@/lib/db', () => jest.fn().mockResolvedValue(undefined));

const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({ auth: () => mockAuth() }));

// ── Connection lifecycle ──────────────────────────────────────
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) await collections[key].drop().catch(() => {});
  await mongoose.connection.close(true).catch(() => {});
  await mongod.stop({ doCleanup: true, force: true }).catch(() => {});
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) await collections[key].deleteMany({});
  mockAuth.mockReset();
});

// ── Helpers ──────────────────────────────────────────────────
function adminSession(id = new mongoose.Types.ObjectId().toString()) {
  return { user: { id, name: 'Admin', email: 'admin@test.com', role: 'admin' } };
}
function memberSession(id = new mongoose.Types.ObjectId().toString()) {
  return { user: { id, name: 'Member', email: 'member@test.com', role: 'member' } };
}
function makeReq(method: string, body?: unknown) {
  return new NextRequest('http://localhost/api/projects', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Module imports (after mocks are set up) ───────────────────
let Project: mongoose.Model<any>;
let User: mongoose.Model<any>;
let GET: (req: NextRequest) => Promise<Response>;
let POST: (req: NextRequest) => Promise<Response>;

beforeAll(async () => {
  const [projectMod, userMod, routeMod] = await Promise.all([
    import('@/models/Project'),
    import('@/models/User'),
    import('@/app/api/projects/route'),
  ]);
  Project = projectMod.default;
  User    = userMod.default;
  GET     = routeMod.GET;
  POST    = routeMod.POST;
});

// ── GET /api/projects ─────────────────────────────────────────
describe('GET /api/projects', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(401);
  });

  it('admin gets all projects', async () => {
    const admin = await User.create({ name: 'Admin', email: 'a@test.com', password: 'x', role: 'admin' });
    await Project.create([
      { name: 'P1', clientName: 'C1', platform: 'other',  createdBy: admin._id },
      { name: 'P2', clientName: 'C2', platform: 'fiverr', createdBy: admin._id },
    ]);
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });

  it('member only gets assigned projects', async () => {
    const admin  = await User.create({ name: 'Admin', email: 'a2@test.com', password: 'x', role: 'admin' });
    const member = await User.create({ name: 'Mem',   email: 'm@test.com',  password: 'x', role: 'member' });
    await Project.create({ name: 'Mine',   clientName: 'C1', platform: 'other',  createdBy: admin._id, assignedMembers: [member._id] });
    await Project.create({ name: 'Others', clientName: 'C2', platform: 'fiverr', createdBy: admin._id });
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Mine');
  });
});

// ── POST /api/projects ────────────────────────────────────────
describe('POST /api/projects', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeReq('POST', { name: 'X', clientName: 'Y', platform: 'other' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 for members', async () => {
    mockAuth.mockResolvedValue(memberSession());
    const res = await POST(makeReq('POST', { name: 'X', clientName: 'Y', platform: 'other' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const admin = await User.create({ name: 'A', email: 'ax@test.com', password: 'x', role: 'admin' });
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST(makeReq('POST', { name: 'Only Name' }));
    expect(res.status).toBe(400);
  });

  it('admin creates a project and gets 201', async () => {
    const admin = await User.create({ name: 'A', email: 'a3@test.com', password: 'x', role: 'admin' });
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST(makeReq('POST', {
      name: 'New Project', clientName: 'Acme',
      platform: 'upwork', description: 'Test project',
    }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('New Project');
    expect(data.clientName).toBe('Acme');
    expect(data.platform).toBe('upwork');
    expect(data.status).toBe('active');
  });
});
