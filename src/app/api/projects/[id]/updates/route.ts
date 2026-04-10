import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Update from '@/models/Update';
import { createNotification } from '@/lib/createNotification';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: projectId } = await params;
  await connectDB();

  const project = await Project.findById(projectId).lean();
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Members can only see updates for their assigned projects
  if (session.user.role !== 'admin') {
    const isMember = (project.assignedMembers as { toString(): string }[])
      .some((m) => m.toString() === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updates = await Update.find({ project: projectId })
    .sort({ date: -1, createdAt: -1 })
    .populate('author', 'name email')
    .lean();

  return NextResponse.json(updates);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: projectId } = await params;
  await connectDB();

  const project = await Project.findById(projectId).lean();
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Members can only post to their assigned projects
  if (session.user.role !== 'admin') {
    const isMember = (project.assignedMembers as { toString(): string }[])
      .some((m) => m.toString() === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { todayWork, tomorrowPlan, blockers, notes } = body as {
    todayWork?: string;
    tomorrowPlan?: string;
    blockers?: string;
    notes?: string;
  };

  if (!todayWork?.trim() || !tomorrowPlan?.trim()) {
    return NextResponse.json(
      { error: 'todayWork and tomorrowPlan are required' },
      { status: 400 }
    );
  }

  try {
    const created = await Update.create({
      project: projectId,
      author: session.user.id,
      content: {
        todayWork: todayWork.trim(),
        tomorrowPlan: tomorrowPlan.trim(),
        ...(blockers?.trim() && { blockers: blockers.trim() }),
        ...(notes?.trim() && { notes: notes.trim() }),
      },
    });

    const populated = await Update.findById(created._id)
      .populate('author', 'name email')
      .lean();

    if (session.user.role !== 'admin') {
      void createNotification({
        memberId: session.user.id,
        memberName: session.user.name ?? 'A team member',
        projectId: projectId,
        projectName: (project as { name: string }).name,
        action: 'created',
        updateId: created._id.toString(),
      });
    }

    return NextResponse.json(populated, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create update';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
