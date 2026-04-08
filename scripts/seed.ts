/**
 * Seed script — creates the initial admin account.
 * Run with: npx tsx scripts/seed.ts
 *
 * IMPORTANT: Change the password on first login.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/db';
import User from '../src/models/User';

async function seed() {
  await connectDB();

  const email = 'lastmubasshir@gmail.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    process.exit(0);
  }

  const password = await bcrypt.hash('admin123', 12);

  await User.create({
    name: 'Mubasshir',
    email,
    password,
    role: 'admin',
  });

  console.log(`Admin account created: ${email}`);
  console.log('IMPORTANT: Change your password after first login!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
