import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Update from '@/models/Update';
import User from '@/models/User';
import AddUpdateModal from '@/components/AddUpdateModal';
import UpdateCard from '@/components/UpdateCard';
import AssignMembersModal from '@/components/AssignMembersModal';
import DeleteProjectButton from '@/components/DeleteProjectButton';
import BackLink from '@/components/BackLink';

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
}

interface UpdateAuthor {
  _id: string;
  name: string;
  email: string;
}

export interface UpdateData {
  _id: string;
  project: string;
  author: UpdateAuthor;
  content: {
    todayWork: string;
    tomorrowPlan: string;
    blockers?: string;
    notes?: string;
  };
  date: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  active:    { label: 'Active',    dot: '#5D8C5A', bg: 'rgba(93,140,90,0.12)',   text: '#7DB87A' },
  'on-hold': { label: 'On Hold',   dot: '#A07850', bg: 'rgba(160,120,80,0.12)',  text: '#C4956A' },
  completed: { label: 'Completed', dot: '#7A9BB5', bg: 'rgba(122,155,181,0.12)', text: '#9BBDD4' },
} as const;

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  fiverr:   'Fiverr',
  upwork:   'Upwork',
  other:    'Other',
};

type PageParams = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: PageParams) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, role } = session.user;
  const { id: projectId } = await params;

  await connectDB();

  const rawProject = await Project.findById(projectId)
    .populate('assignedMembers', 'name email')
    .lean();

  if (!rawProject) notFound();

  if (role !== 'admin') {
    const isMember = (rawProject.assignedMembers as { _id: { toString(): string } }[])
      .some((m) => m._id.toString() === userId);
    if (!isMember) redirect('/projects');
  }

  const members = (rawProject.assignedMembers as PopulatedMember[]).map((m) => ({
    _id: m._id.toString(),
    name: m.name,
    email: m.email,
  }));

  const project = {
    _id: rawProject._id.toString(),
    name: rawProject.name,
    clientName: rawProject.clientName,
    platform: rawProject.platform,
    platformLink: rawProject.platformLink,
    status: rawProject.status,
    description: rawProject.description,
    assignedMembers: members,
  };

  const allUsers = role === 'admin'
    ? (await User.find({}).select('name email').sort({ name: 1 }).lean()).map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
      }))
    : [];

  const rawUpdates = await Update.find({ project: projectId })
    .sort({ date: -1, createdAt: -1 })
    .populate('author', 'name email')
    .lean();

  const updates: UpdateData[] = rawUpdates.map((u) => {
    const author = u.author as unknown as PopulatedMember;
    return {
      _id: u._id.toString(),
      project: projectId,
      author: {
        _id: author._id.toString(),
        name: author.name,
        email: author.email,
      },
      content: {
        todayWork: u.content.todayWork,
        tomorrowPlan: u.content.tomorrowPlan,
        ...(u.content.blockers && { blockers: u.content.blockers }),
        ...(u.content.notes && { notes: u.content.notes }),
      },
      date: u.date.toISOString(),
      createdAt: u.createdAt.toISOString(),
    };
  });

  const statusCfg = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;

  return (
    <div style={{ padding: '28px 36px', minHeight: '100%' }}>

      {/* Back link */}
      <BackLink href="/projects" label="Projects" />

      {/* ── Page header ─────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 16, marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            margin: '0 0 3px', fontSize: 24, fontWeight: 700,
            color: '#F5EDE6', letterSpacing: '-0.025em',
          }}>
            {project.name}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#B5A795' }}>
            (Client: {project.clientName})
          </p>
        </div>

        {/* Header action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#2D2820', border: '1px solid #3C3328',
            borderRadius: 8, padding: '8px 14px',
            fontSize: 12, fontWeight: 500, color: '#DCCBB8',
            cursor: 'default', fontFamily: 'inherit',
          }}>
            ↑↓ Sort
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#2D2820', border: '1px solid #3C3328',
            borderRadius: 8, padding: '8px 14px',
            fontSize: 12, fontWeight: 500, color: '#DCCBB8',
            cursor: 'default', fontFamily: 'inherit',
          }}>
            ▽ Filter
          </button>
          <AddUpdateModal
            projectId={project._id}
            projectName={project.name}
            clientName={project.clientName}
          />
        </div>
      </div>

      {/* ── Three-column info cards ──────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: role === 'admin' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 28,
        alignItems: 'stretch',
      }}>

        {/* PROJECT INFO */}
        <div style={{
          background: '#2D2820', border: '1px solid #3C3328',
          borderRadius: 14, padding: '18px 20px',
        }}>
          <p style={{
            margin: '0 0 14px', fontSize: 10, fontWeight: 700,
            color: '#A89888', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Project Info
          </p>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#B5A795' }}>• Status</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: statusCfg.bg, borderRadius: 20, padding: '3px 10px',
              fontSize: 11, fontWeight: 600, color: statusCfg.text,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.dot, flexShrink: 0 }} />
              {statusCfg.label}
            </span>
          </div>

          {/* Platform */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: project.platformLink ? 10 : 0 }}>
            <span style={{ fontSize: 13, color: '#B5A795' }}>• Platform</span>
            <span style={{
              fontSize: 12, fontWeight: 500, color: '#DCCBB8',
              background: '#241E18', border: '1px solid #3C3328',
              borderRadius: 6, padding: '3px 10px',
            }}>
              {PLATFORM_LABEL[project.platform] ?? project.platform}
            </span>
          </div>

          {/* Platform link */}
          {project.platformLink && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
              <span style={{ fontSize: 13, color: '#B5A795' }}>• Link</span>
              <a
                href={project.platformLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12, color: '#C4956A', textDecoration: 'none',
                  background: 'rgba(196,149,106,0.08)', borderRadius: 6, padding: '3px 10px',
                }}
              >
                Open ↗
              </a>
            </div>
          )}

        </div>

        {/* TEAM */}
        <div style={{
          background: '#2D2820', border: '1px solid #3C3328',
          borderRadius: 14, padding: '18px 20px',
        }}>
          <p style={{
            margin: '0 0 16px', fontSize: 10, fontWeight: 700,
            color: '#A89888', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Team ({members.length} Member{members.length !== 1 ? 's' : ''})
          </p>

          {members.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#A89888' }}>No members assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {members.map((m) => {
                const hue = (m.name.charCodeAt(0) * 37 + m.name.charCodeAt(m.name.length - 1) * 17) % 360;
                return (
                  <div key={m._id} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 7,
                  }}>
                    <span style={{
                      width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${hue}, 25%, 34%)`,
                      border: `2px solid hsl(${hue}, 25%, 46%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: '#C4956A',
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#EDE4D8', textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ADMIN ACTIONS */}
        {role === 'admin' && (
          <div style={{
            background: '#2D2820', border: '1px solid #3C3328',
            borderRadius: 14, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              color: '#A89888', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Admin Actions
            </p>
            <AssignMembersModal
              projectId={project._id}
              assignedMemberIds={members.map((m) => m._id)}
              allMembers={allUsers}
            />
            <DeleteProjectButton projectId={project._id} projectName={project.name} />
          </div>
        )}
      </div>

      {/* ── Updates section ─────────────────────────── */}
      <div>
        {/* Updates header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F5EDE6', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Updates{' '}
            <span style={{ fontWeight: 400, color: '#A89888', fontSize: 13, textTransform: 'none', letterSpacing: 0 }}>
              ({updates.length} unique log{updates.length !== 1 ? 's' : ''})
            </span>
          </h2>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              background: '#2D2820', border: '1px solid #3C3328',
              borderRadius: 8, padding: '6px 12px',
              fontSize: 12, color: '#DCCBB8', cursor: 'default', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Latest ▾
            </button>
            <button style={{
              background: '#2D2820', border: '1px solid #3C3328',
              borderRadius: 8, padding: '6px 12px',
              fontSize: 12, color: '#DCCBB8', cursor: 'default', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {updates.length} unique{updates.length !== 1 ? 's' : ''} ▾
            </button>
          </div>
        </div>

        {/* Updates grid */}
        {updates.length === 0 ? (
          <EmptyUpdates />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            alignItems: 'start',
          }}>
            {updates.map((update) => (
              <UpdateCard
                key={update._id}
                update={update}
                projectName={project.name}
                clientName={project.clientName}
                currentUserId={userId}
                currentUserRole={role}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function EmptyUpdates() {
  return (
    <div style={{
      background: '#2D2820',
      border: '1px solid #3C3328',
      borderRadius: 14,
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📝</div>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#DCCBB8' }}>
        No updates yet
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#A89888' }}>
        Post the first update using the button above.
      </p>
    </div>
  );
}
