import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
}

export interface ProjectData {
  _id: string;
  name: string;
  clientName: string;
  platform: 'whatsapp' | 'fiverr' | 'upwork' | 'other';
  platformLink?: string;
  status: 'active' | 'on-hold' | 'completed';
  description?: string;
  assignedMembers: PopulatedMember[];
  createdAt: string;
  updatedAt: string;
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: userId, role } = session.user;

  await connectDB();

  const filter = role === 'admin' ? {} : { assignedMembers: userId };
  const raw = await Project.find(filter)
    .sort({ updatedAt: -1 })
    .populate('assignedMembers', 'name email')
    .lean();

  const projects: ProjectData[] = raw.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    clientName: p.clientName,
    platform: p.platform,
    platformLink: p.platformLink,
    status: p.status,
    description: p.description,
    assignedMembers: (p.assignedMembers as PopulatedMember[]).map((m) => ({
      _id: m._id.toString(),
      name: m.name,
      email: m.email,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#F0E6DC', letterSpacing: '-0.025em' }}>
            Projects
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#7A6B5D' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {role === 'member' ? ' assigned to you' : ' total'}
          </p>
        </div>

        {role === 'admin' && <CreateProjectModal />}
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <EmptyState isAdmin={role === 'admin'} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} isAdmin={role === 'admin'} />
          ))}
        </div>
      )}

    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div style={{
      background: '#221E19',
      border: '1px solid #2E2923',
      borderRadius: 14,
      padding: '72px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500, color: '#B8A898' }}>
        No projects yet
      </p>
      <p style={{ margin: 0, fontSize: 13, color: '#5A4F45' }}>
        {isAdmin ? 'Create your first project using the button above.' : 'You have no projects assigned to you yet.'}
      </p>
    </div>
  );
}
