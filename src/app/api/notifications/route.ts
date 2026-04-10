import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({}).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ read: false }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
