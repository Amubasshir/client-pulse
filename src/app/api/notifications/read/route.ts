import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  let body: { id?: string; all?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // empty body → treat as "mark all"
  }

  if (body.id) {
    await Notification.findByIdAndUpdate(body.id, { read: true });
  } else {
    await Notification.updateMany({ read: false }, { read: true });
  }

  return NextResponse.json({ success: true });
}
