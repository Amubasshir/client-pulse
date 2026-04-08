import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from '@/models/User';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

/**
 * Validates credentials against the database.
 * Extracted from NextAuth config so it can be unit-tested without Next.js internals.
 */
export async function authorizeUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as 'admin' | 'member',
  };
}
