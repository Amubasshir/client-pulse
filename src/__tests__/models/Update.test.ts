/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { connect, disconnect, clearDatabase } from '../helpers/db';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearDatabase);

let Update: mongoose.Model<any>;
let projectId: mongoose.Types.ObjectId;
let authorId: mongoose.Types.ObjectId;

beforeAll(async () => {
  const mod = await import('@/models/Update');
  Update = mod.default;
  projectId = new mongoose.Types.ObjectId();
  authorId = new mongoose.Types.ObjectId();
});

describe('Update model', () => {
  const validUpdate = () => ({
    project: projectId,
    author: authorId,
    content: {
      todayWork: 'Implemented auth flow',
      tomorrowPlan: 'Work on dashboard API',
    },
    date: new Date('2026-04-08'),
  });

  it('saves a valid update', async () => {
    const update = await new Update(validUpdate()).save();
    expect(update._id).toBeDefined();
    expect(update.content.todayWork).toBe('Implemented auth flow');
  });

  it('defaults date to today when not provided', async () => {
    const { date, ...rest } = validUpdate();
    const update = await new Update(rest).save();
    const today = new Date().toDateString();
    expect(update.date.toDateString()).toBe(today);
  });

  it('fails when project is missing', async () => {
    const { project, ...rest } = validUpdate();
    await expect(new Update(rest).save()).rejects.toThrow(/project/i);
  });

  it('fails when author is missing', async () => {
    const { author, ...rest } = validUpdate();
    await expect(new Update(rest).save()).rejects.toThrow(/author/i);
  });

  it('fails when todayWork is missing', async () => {
    const update = new Update({
      ...validUpdate(),
      content: { tomorrowPlan: 'something' },
    });
    await expect(update.save()).rejects.toThrow(/todayWork/i);
  });

  it('fails when tomorrowPlan is missing', async () => {
    const update = new Update({
      ...validUpdate(),
      content: { todayWork: 'something' },
    });
    await expect(update.save()).rejects.toThrow(/tomorrowPlan/i);
  });

  it('saves with optional blockers field', async () => {
    const update = await new Update({
      ...validUpdate(),
      content: { ...validUpdate().content, blockers: 'Waiting for API keys' },
    }).save();
    expect(update.content.blockers).toBe('Waiting for API keys');
  });

  it('saves with optional notes field', async () => {
    const update = await new Update({
      ...validUpdate(),
      content: { ...validUpdate().content, notes: 'Internal note here' },
    }).save();
    expect(update.content.notes).toBe('Internal note here');
  });

  it('stores timestamps', async () => {
    const update = await new Update(validUpdate()).save();
    expect(update.createdAt).toBeInstanceOf(Date);
    expect(update.updatedAt).toBeInstanceOf(Date);
  });
});
