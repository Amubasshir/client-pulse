import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import CreateMemberModal from '@/components/CreateMemberModal';
import MemberCard from '@/components/MemberCard';

export interface MemberData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
  projectCount: number;
}

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  await connectDB();

  const rawUsers = await User.find({}).sort({ createdAt: 1 }).select('-password').lean();

  // Count assigned projects per user via aggregation
  const counts: { _id: string; count: number }[] = await Project.aggregate([
    { $unwind: '$assignedMembers' },
    { $group: { _id: { $toString: '$assignedMembers' }, count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const members: MemberData[] = rawUsers.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role as 'admin' | 'member',
    createdAt: u.createdAt.toISOString(),
    projectCount: countMap[u._id.toString()] ?? 0,
  }));

  const currentUserId = session.user.id;
  const adminCount = members.filter((m) => m.role === 'admin').length;

  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#F5EDE6', letterSpacing: '-0.025em' }}>
            Team
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#B5A795' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateMemberModal />
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 14,
        }}>
          {members.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              currentUserId={currentUserId}
              isLastAdmin={member.role === 'admin' && adminCount <= 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: '#221E19', border: '1px solid #2E2923',
      borderRadius: 14, padding: '72px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500, color: '#DCCBB8' }}>
        No team members yet
      </p>
      <p style={{ margin: 0, fontSize: 13, color: '#A89888' }}>
        Add your first member using the button above.
      </p>
    </div>
  );
}
