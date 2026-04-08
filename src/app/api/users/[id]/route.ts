import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, role, password } = body as {
    name?: string;
    email?: string;
    role?: string;
    password?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  // Check email uniqueness if changed
  if (email.trim().toLowerCase() !== user.email) {
    const conflict = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: id } });
    if (conflict) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
  }

  // Prevent removing the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot demote the only admin' }, { status: 400 });
    }
  }

  user.name  = name.trim();
  user.email = email.trim().toLowerCase();
  if (role === 'admin' || role === 'member') user.role = role;

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'password must be at least 6 characters' }, { status: 400 });
    }
    user.password = await bcrypt.hash(password, 12);
  }

  await user.save();

  return NextResponse.json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, createdAt: user.createdAt,
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  // Prevent self-delete
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the only admin' }, { status: 400 });
    }
  }

  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
