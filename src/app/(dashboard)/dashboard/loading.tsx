export default function DashboardLoading() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>

      {/* Header skeleton */}
      <div style={{ marginBottom: 36 }}>
        <Bone width={220} height={22} radius={6} />
        <Bone width={280} height={14} radius={4} style={{ marginTop: 10 }} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            background: '#221E19', border: '1px solid #2E2923',
            borderRadius: 12, padding: '20px 22px',
          }}>
            <Bone width={100} height={11} radius={4} />
            <Bone width={60} height={28} radius={6} style={{ marginTop: 10 }} />
          </div>
        ))}
      </div>

      {/* Recent updates */}
      <Bone width={140} height={12} radius={4} style={{ marginBottom: 16 }} />
      <div style={{ background: '#221E19', border: '1px solid #2E2923', borderRadius: 12, overflow: 'hidden' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px',
            borderBottom: i < 4 ? '1px solid #2A2520' : 'none',
          }}>
            <Bone width={30} height={30} radius={15} />
            <div style={{ flex: 1 }}>
              <Bone width={200} height={13} radius={4} />
              <Bone width={320} height={12} radius={4} style={{ marginTop: 6 }} />
            </div>
            <Bone width={48} height={11} radius={4} />
          </div>
        ))}
      </div>

    </div>
  );
}

function Bone({ width, height, radius, style }: {
  width: number; height: number; radius: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #2A2520 25%, #322D27 50%, #2A2520 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s ease infinite',
      ...style,
    }} />
  );
}
