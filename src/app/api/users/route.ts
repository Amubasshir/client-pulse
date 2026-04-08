import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select('-password')
    .lean();

  return NextResponse.json(users);
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

  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: 'name, email, and password are required' },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'password must be at least 6 characters' },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: role === 'admin' ? 'admin' : 'member',
    });

    return NextResponse.json(
      { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
