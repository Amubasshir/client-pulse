import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Update from '@/models/Update';
import User from '@/models/User';
import type { Types } from 'mongoose';

interface PopulatedRef {
  _id: Types.ObjectId;
  name: string;
}

interface RecentUpdate {
  _id: string;
  projectId: string;
  projectName: string;
  authorName: string;
  todayWork: string;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, role, name: sessionName } = session.user;
  const firstName = sessionName?.split(' ')[0] ?? 'there';
  const isAdmin = role === 'admin';

  await connectDB();

  const projectFilter = isAdmin ? {} : { assignedMembers: userId };

  // For member: scope updates to assigned projects
  let updateFilter: Record<string, unknown> = {};
  if (!isAdmin) {
    const memberProjects = await Project.find({ assignedMembers: userId }, '_id').lean();
    const projectIds = memberProjects.map((p) => p._id);
    updateFilter = { project: { $in: projectIds } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeProjects, todayUpdates, teamMembers] = await Promise.all([
    Project.countDocuments({ ...projectFilter, status: 'active' }),
    Update.countDocuments({ ...updateFilter, createdAt: { $gte: today } }),
    User.countDocuments(),
  ]);

  const recentRaw = await Update.find(updateFilter)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('project', 'name')
    .populate('author', 'name')
    .lean();

  const recentUpdates: RecentUpdate[] = recentRaw
    .filter((u) => u.project && u.author)
    .map((u) => ({
      _id: u._id.toString(),
      projectId: (u.project as PopulatedRef)._id.toString(),
      projectName: (u.project as PopulatedRef).name,
      authorName: (u.author as PopulatedRef).name,
      todayWork: u.content.todayWork,
      createdAt: u.createdAt.toISOString(),
    }));

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 600,
          color: '#F5EDE6', letterSpacing: '-0.025em',
        }}>
          Good to see you, {firstName}
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#B5A795' }}>
          Here&apos;s a summary of what&apos;s happening across your projects.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active Projects" value={String(activeProjects)} />
        <StatCard label="Updates Today" value={String(todayUpdates)} />
        <StatCard label="Team Members" value={String(teamMembers)} />
      </div>

      {/* Recent updates */}
      <section>
        <h2 style={{
          margin: '0 0 16px', fontSize: 13, fontWeight: 500,
          color: '#DCCBB8', textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Recent Updates
        </h2>

        {recentUpdates.length === 0 ? (
          <div style={{
            background: '#221E19',
            border: '1px solid #2E2923',
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#A89888' }}>
              No updates yet — start by creating a project.
            </p>
          </div>
        ) : (
          <div style={{
            background: '#221E19',
            border: '1px solid #2E2923',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {recentUpdates.map((update, i) => (
              <div
                key={update._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < recentUpdates.length - 1 ? '1px solid #2A2520' : 'none',
                }}
              >
                {/* Author avatar */}
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${(update.authorName.charCodeAt(0) * 17) % 360}, 22%, 26%)`,
                  border: '1px solid #3A332C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#C4956A',
                  marginTop: 1,
                }}>
                  {update.authorName.charAt(0).toUpperCase()}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F5EDE6' }}>
                      {update.authorName}
                    </span>
                    <span style={{ fontSize: 11, color: '#A89888' }}>logged an update in</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: '#C4956A',
                      background: 'rgba(196,149,106,0.08)',
                      padding: '1px 7px', borderRadius: 4,
                    }}>
                      {update.projectName}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 12, color: '#DCCBB8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 600,
                  }}>
                    {update.todayWork}
                  </p>
                </div>

                {/* Time */}
                <span style={{
                  fontSize: 11, color: '#A89888', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {timeAgo(update.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

/* ── StatCard ────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#221E19',
      border: '1px solid #2E2923',
      borderRadius: 12,
      padding: '20px 22px',
      boxShadow: 'inset 0 1px 0 rgba(196,149,106,0.06)',
    }}>
      <p style={{
        margin: '0 0 6px', fontSize: 11, fontWeight: 500,
        color: '#B5A795', textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#F5EDE6', letterSpacing: '-0.04em' }}>
        {value}
      </p>
    </div>
  );
}
