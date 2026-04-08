import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Update from '@/models/Update';
import AddUpdateModal from '@/components/AddUpdateModal';
import UpdateCard from '@/components/UpdateCard';

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
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  other: 'Other',
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

  // Members can only view their assigned projects
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
    <div style={{ padding: '32px 36px', maxWidth: 820 }}>

      {/* Back link */}
      <Link
        href="/projects"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: '#7A6B5D', textDecoration: 'none',
          marginBottom: 20, transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#C4956A'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#7A6B5D'; }}
      >
        ← Projects
      </Link>

      {/* Project header */}
      <div style={{
        background: '#221E19',
        border: '1px solid #2E2923',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: statusCfg.bg, borderRadius: 20, padding: '3px 10px',
                fontSize: 11, fontWeight: 500, color: statusCfg.text,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.dot, flexShrink: 0 }} />
                {statusCfg.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 500, color: '#7A6B5D',
                background: '#1C1814', border: '1px solid #2E2923',
                borderRadius: 6, padding: '3px 9px',
              }}>
                {PLATFORM_LABEL[project.platform] ?? project.platform}
              </span>
              {project.platformLink && (
                <a
                  href={project.platformLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11, color: '#C4956A', textDecoration: 'none',
                    background: 'rgba(196,149,106,0.08)', borderRadius: 6, padding: '3px 9px',
                  }}
                >
                  Open link ↗
                </a>
              )}
            </div>

            {/* Name + client */}
            <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#F0E6DC', letterSpacing: '-0.025em' }}>
              {project.name}
            </h1>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#7A6B5D' }}>
              Client: {project.clientName}
            </p>

            {project.description && (
              <p style={{ margin: 0, fontSize: 13, color: '#B8A898', lineHeight: 1.6 }}>
                {project.description}
              </p>
            )}
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#5A4F45', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Team
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {members.slice(0, 5).map((m, i) => (
                  <span
                    key={m._id}
                    title={m.name}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `hsl(${(m.name.charCodeAt(0) * 17) % 360}, 25%, 28%)`,
                      border: '2px solid #221E19',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, color: '#C4956A',
                      marginLeft: i === 0 ? 0 : -8,
                      position: 'relative', zIndex: 5 - i,
                    }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                ))}
                {members.length > 5 && (
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#2A2520', border: '2px solid #221E19',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#7A6B5D', marginLeft: -8,
                  }}>
                    +{members.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Updates section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: '#F0E6DC' }}>
            Updates
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: '#7A6B5D' }}>
            {updates.length} update{updates.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <AddUpdateModal projectId={project._id} projectName={project.name} clientName={project.clientName} />
      </div>

      {/* Updates list */}
      {updates.length === 0 ? (
        <EmptyUpdates />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
  );
}

function EmptyUpdates() {
  return (
    <div style={{
      background: '#221E19',
      border: '1px solid #2E2923',
      borderRadius: 14,
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📝</div>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#B8A898' }}>
        No updates yet
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#5A4F45' }}>
        Post the first update using the button above.
      </p>
    </div>
  );
}
