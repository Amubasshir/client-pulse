import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const { id, role } = session.user;
  const filter = role === 'admin' ? {} : { assignedMembers: id };
  const projects = await Project.find(filter)
    .sort({ updatedAt: -1 })
    .populate('assignedMembers', 'name email')
    .lean();

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, clientName, platform, platformLink, status, description, assignedMembers } = body as {
    name?: string;
    clientName?: string;
    platform?: string;
    platformLink?: string;
    status?: string;
    description?: string;
    assignedMembers?: string[];
  };

  if (!name || !clientName || !platform) {
    return NextResponse.json(
      { error: 'name, clientName, and platform are required' },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const project = await Project.create({
      name,
      clientName,
      platform,
      ...(platformLink && { platformLink }),
      ...(status && { status }),
      ...(description && { description }),
      assignedMembers: assignedMembers ?? [],
      createdBy: session.user.id,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
