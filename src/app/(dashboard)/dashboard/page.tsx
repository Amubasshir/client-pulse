import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 600,
          color: '#F0E6DC', letterSpacing: '-0.025em',
        }}>
          Good to see you, {name}
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7A6B5D' }}>
          Here&apos;s a summary of what&apos;s happening across your projects.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active Projects" value="—" />
        <StatCard label="Updates This Week" value="—" />
        <StatCard label="Team Members" value="—" />
      </div>

      {/* Recent updates placeholder */}
      <section>
        <h2 style={{
          margin: '0 0 16px', fontSize: 13, fontWeight: 500,
          color: '#B8A898', textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Recent Updates
        </h2>
        <div style={{
          background: '#221E19',
          border: '1px solid #2E2923',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#5A4F45' }}>
            No updates yet — start by creating a project.
          </p>
        </div>
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
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 500, color: '#7A6B5D', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#F0E6DC', letterSpacing: '-0.04em' }}>
        {value}
      </p>
    </div>
  );
}
