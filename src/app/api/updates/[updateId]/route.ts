import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Update from '@/models/Update';

type Params = { params: Promise<{ updateId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { updateId } = await params;
  await connectDB();

  const update = await Update.findById(updateId);
  if (!update) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Members can only edit their own updates
  if (session.user.role !== 'admin' && update.author.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  update.content = {
    todayWork: todayWork.trim(),
    tomorrowPlan: tomorrowPlan.trim(),
    ...(blockers?.trim() ? { blockers: blockers.trim() } : {}),
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  };
  await update.save();

  const populated = await Update.findById(updateId)
    .populate('author', 'name email')
    .lean();

  return NextResponse.json(populated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { updateId } = await params;
  await connectDB();

  const update = await Update.findById(updateId);
  if (!update) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Members can only delete their own updates
  if (session.user.role !== 'admin' && update.author.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Update.findByIdAndDelete(updateId);
  return NextResponse.json({ success: true });
}
