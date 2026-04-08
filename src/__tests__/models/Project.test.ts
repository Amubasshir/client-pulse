/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { connect, disconnect, clearDatabase } from '../helpers/db';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearDatabase);

let Project: mongoose.Model<any>;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  const mod = await import('@/models/Project');
  Project = mod.default;
  userId = new mongoose.Types.ObjectId();
});

describe('Project model', () => {
  const validProject = () => ({
    name: 'Swedish Moving Platform',
    clientName: 'Erik Johansson',
    platform: 'upwork',
    createdBy: userId,
  });

  it('saves a valid project with required fields', async () => {
    const project = await new Project(validProject()).save();
    expect(project._id).toBeDefined();
    expect(project.name).toBe('Swedish Moving Platform');
    expect(project.status).toBe('active'); // default
  });

  it('fails when name is missing', async () => {
    const { name, ...rest } = validProject();
    await expect(new Project(rest).save()).rejects.toThrow(/name/i);
  });

  it('fails when clientName is missing', async () => {
    const { clientName, ...rest } = validProject();
    await expect(new Project(rest).save()).rejects.toThrow(/clientName/i);
  });

  it('fails when platform is missing', async () => {
    const { platform, ...rest } = validProject();
    await expect(new Project(rest).save()).rejects.toThrow(/platform/i);
  });

  it('fails when createdBy is missing', async () => {
    const { createdBy, ...rest } = validProject();
    await expect(new Project(rest).save()).rejects.toThrow(/createdBy/i);
  });

  it('fails with an invalid platform value', async () => {
    const project = new Project({ ...validProject(), platform: 'telegram' });
    await expect(project.save()).rejects.toThrow(/platform/i);
  });

  it('accepts all valid platform values', async () => {
    for (const platform of ['whatsapp', 'fiverr', 'upwork', 'other']) {
      const p = await new Project({ ...validProject(), platform }).save();
      expect(p.platform).toBe(platform);
      await p.deleteOne();
    }
  });

  it('fails with an invalid status value', async () => {
    const project = new Project({ ...validProject(), status: 'archived' });
    await expect(project.save()).rejects.toThrow(/status/i);
  });

  it('accepts all valid status values', async () => {
    for (const status of ['active', 'on-hold', 'completed']) {
      const p = await new Project({ ...validProject(), status }).save();
      expect(p.status).toBe(status);
      await p.deleteOne();
    }
  });

  it('stores assignedMembers as an array of ObjectIds', async () => {
    const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    const project = await new Project({
      ...validProject(),
      assignedMembers: memberIds,
    }).save();
    expect(project.assignedMembers).toHaveLength(2);
  });

  it('stores timestamps', async () => {
    const project = await new Project(validProject()).save();
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.updatedAt).toBeInstanceOf(Date);
  });
});
