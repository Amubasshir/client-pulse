/**
 * @jest-environment node
 *
 * Tests for:
 *   GET  /api/projects/[id]/updates
 *   POST /api/projects/[id]/updates
 *   PATCH  /api/updates/[updateId]
 *   DELETE /api/updates/[updateId]
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────
jest.mock('@/lib/db', () => jest.fn().mockResolvedValue(undefined));

const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({ auth: () => mockAuth() }));

// ── Connection lifecycle ───────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────
function adminSession(id = new mongoose.Types.ObjectId().toString()) {
  return { user: { id, name: 'Admin', email: 'admin@test.com', role: 'admin' } };
}
function memberSession(id = new mongoose.Types.ObjectId().toString()) {
  return { user: { id, name: 'Member', email: 'member@test.com', role: 'member' } };
}
function makeReq(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── Module imports (after mocks) ───────────────────────────────
let Project: mongoose.Model<any>;
let User: mongoose.Model<any>;
let UpdateModel: mongoose.Model<any>;
let GET_list: (req: NextRequest, ctx: any) => Promise<Response>;
let POST_create: (req: NextRequest, ctx: any) => Promise<Response>;
let PATCH_edit: (req: NextRequest, ctx: any) => Promise<Response>;
let DELETE_remove: (req: NextRequest, ctx: any) => Promise<Response>;

beforeAll(async () => {
  const [projectMod, userMod, updateMod, projectUpdatesMod, updateMod2] = await Promise.all([
    import('@/models/Project'),
    import('@/models/User'),
    import('@/models/Update'),
    import('@/app/api/projects/[id]/updates/route'),
    import('@/app/api/updates/[updateId]/route'),
  ]);
  Project      = projectMod.default;
  User         = userMod.default;
  UpdateModel  = updateMod.default;
  GET_list     = projectUpdatesMod.GET;
  POST_create  = projectUpdatesMod.POST;
  PATCH_edit   = updateMod2.PATCH;
  DELETE_remove = updateMod2.DELETE;
});

// ── Seed helpers ───────────────────────────────────────────────
async function seedAdmin() {
  return User.create({ name: 'Admin', email: 'admin@x.com', password: 'hashed', role: 'admin' });
}
async function seedMember() {
  return User.create({ name: 'Member', email: 'member@x.com', password: 'hashed', role: 'member' });
}
async function seedProject(createdBy: string, assignedMembers: string[] = []) {
  return Project.create({
    name: 'Test Project', clientName: 'Acme',
    platform: 'other', createdBy,
    assignedMembers,
  });
}
async function seedUpdate(projectId: string, authorId: string, overrides = {}) {
  return UpdateModel.create({
    project: projectId,
    author: authorId,
    content: {
      todayWork: 'Built the feature',
      tomorrowPlan: 'Write tests',
      ...overrides,
    },
  });
}

// ── GET /api/projects/[id]/updates ─────────────────────────────
describe('GET /api/projects/[id]/updates', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const admin = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${project._id}/updates`),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when project does not exist', async () => {
    const admin = await seedAdmin();
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${fakeId}/updates`),
      { params: Promise.resolve({ id: fakeId }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when member is not assigned to the project', async () => {
    const admin  = await seedAdmin();
    const member = await seedMember();
    const project = await seedProject(admin._id.toString()); // no members
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${project._id}/updates`),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(403);
  });

  it('admin gets all updates for any project', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    await seedUpdate(project._id.toString(), admin._id.toString());
    await seedUpdate(project._id.toString(), admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${project._id}/updates`),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });

  it('assigned member gets updates for their project', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString(), [member._id.toString()]);
    await seedUpdate(project._id.toString(), member._id.toString());
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${project._id}/updates`),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].content.todayWork).toBe('Built the feature');
  });

  it('returned updates include populated author name', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    await seedUpdate(project._id.toString(), admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await GET_list(
      makeReq('GET', `http://localhost/api/projects/${project._id}/updates`),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    const data = await res.json();
    expect(data[0].author.name).toBe('Admin');
  });
});

// ── POST /api/projects/[id]/updates ────────────────────────────
describe('POST /api/projects/[id]/updates', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: 'Done', tomorrowPlan: 'More',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when project does not exist', async () => {
    const admin  = await seedAdmin();
    const fakeId = new mongoose.Types.ObjectId().toString();
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${fakeId}/updates`, {
        todayWork: 'Done', tomorrowPlan: 'More',
      }),
      { params: Promise.resolve({ id: fakeId }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when member is not assigned to the project', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString()); // member not assigned
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: 'Done', tomorrowPlan: 'More',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when todayWork is missing', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        tomorrowPlan: 'More',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when tomorrowPlan is missing', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: 'Done',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(400);
  });

  it('admin creates update with 201', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: 'Finished login', tomorrowPlan: 'Start dashboard',
        blockers: 'Waiting for design', notes: 'Internal only',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.content.todayWork).toBe('Finished login');
    expect(data.content.tomorrowPlan).toBe('Start dashboard');
    expect(data.content.blockers).toBe('Waiting for design');
    expect(data.content.notes).toBe('Internal only');
    expect(data.author.name).toBe('Admin');
  });

  it('assigned member can create an update', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString(), [member._id.toString()]);
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: 'Member work', tomorrowPlan: 'Member plan',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.content.todayWork).toBe('Member work');
    expect(data.author.name).toBe('Member');
  });

  it('trims whitespace from content fields', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await POST_create(
      makeReq('POST', `http://localhost/api/projects/${project._id}/updates`, {
        todayWork: '  spaced  ', tomorrowPlan: '  also spaced  ',
      }),
      { params: Promise.resolve({ id: project._id.toString() }) },
    );
    const data = await res.json();
    expect(data.content.todayWork).toBe('spaced');
    expect(data.content.tomorrowPlan).toBe('also spaced');
  });
});

// ── PATCH /api/updates/[updateId] ──────────────────────────────
describe('PATCH /api/updates/[updateId]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), admin._id.toString());
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'New', tomorrowPlan: 'New plan',
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when update does not exist', async () => {
    const admin  = await seedAdmin();
    const fakeId = new mongoose.Types.ObjectId().toString();
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${fakeId}`, {
        todayWork: 'New', tomorrowPlan: 'New plan',
      }),
      { params: Promise.resolve({ updateId: fakeId }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when member tries to edit another member\'s update', async () => {
    const admin   = await seedAdmin();
    const member1 = await seedMember();
    const member2 = await User.create({ name: 'M2', email: 'm2@x.com', password: 'x', role: 'member' });
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), member1._id.toString());
    mockAuth.mockResolvedValue(memberSession(member2._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'Hijacked', tomorrowPlan: 'Hijacked plan',
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(403);
  });

  it('member can edit their own update', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString(), [member._id.toString()]);
    const update  = await seedUpdate(project._id.toString(), member._id.toString());
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'Updated work', tomorrowPlan: 'Updated plan',
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.todayWork).toBe('Updated work');
  });

  it('admin can edit any update', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), member._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'Admin override', tomorrowPlan: 'Admin plan',
        blockers: 'None',
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.todayWork).toBe('Admin override');
    expect(data.content.blockers).toBe('None');
  });

  it('returns 400 when required fields are missing', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), admin._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'Only today',
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(400);
  });

  it('clears optional fields when omitted on edit', async () => {
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), admin._id.toString(), {
      blockers: 'Had a blocker', notes: 'Had a note',
    });
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await PATCH_edit(
      makeReq('PATCH', `http://localhost/api/updates/${update._id}`, {
        todayWork: 'New work', tomorrowPlan: 'New plan',
        // blockers and notes intentionally omitted
      }),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.blockers).toBeUndefined();
    expect(data.content.notes).toBeUndefined();
  });
});

// ── DELETE /api/updates/[updateId] ─────────────────────────────
describe('DELETE /api/updates/[updateId]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const admin   = await seedAdmin();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), admin._id.toString());
    const res = await DELETE_remove(
      makeReq('DELETE', `http://localhost/api/updates/${update._id}`),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when update does not exist', async () => {
    const admin  = await seedAdmin();
    const fakeId = new mongoose.Types.ObjectId().toString();
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await DELETE_remove(
      makeReq('DELETE', `http://localhost/api/updates/${fakeId}`),
      { params: Promise.resolve({ updateId: fakeId }) },
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when member tries to delete another member\'s update', async () => {
    const admin   = await seedAdmin();
    const member1 = await seedMember();
    const member2 = await User.create({ name: 'M2', email: 'm2@x.com', password: 'x', role: 'member' });
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), member1._id.toString());
    mockAuth.mockResolvedValue(memberSession(member2._id.toString()));
    const res = await DELETE_remove(
      makeReq('DELETE', `http://localhost/api/updates/${update._id}`),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(403);
  });

  it('member can delete their own update', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), member._id.toString());
    mockAuth.mockResolvedValue(memberSession(member._id.toString()));
    const res = await DELETE_remove(
      makeReq('DELETE', `http://localhost/api/updates/${update._id}`),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    const gone = await UpdateModel.findById(update._id);
    expect(gone).toBeNull();
  });

  it('admin can delete any update', async () => {
    const admin   = await seedAdmin();
    const member  = await seedMember();
    const project = await seedProject(admin._id.toString());
    const update  = await seedUpdate(project._id.toString(), member._id.toString());
    mockAuth.mockResolvedValue(adminSession(admin._id.toString()));
    const res = await DELETE_remove(
      makeReq('DELETE', `http://localhost/api/updates/${update._id}`),
      { params: Promise.resolve({ updateId: update._id.toString() }) },
    );
    expect(res.status).toBe(200);
    const gone = await UpdateModel.findById(update._id);
    expect(gone).toBeNull();
  });
});
