export default function ProjectsLoading() {
  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <Bone width={100} height={22} radius={6} />
          <Bone width={140} height={13} radius={4} style={{ marginTop: 8 }} />
        </div>
        <Bone width={120} height={36} radius={8} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            background: '#221E19', border: '1px solid #2E2923',
            borderRadius: 12, padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Bone width={72} height={20} radius={10} />
              <Bone width={60} height={20} radius={6} />
            </div>
            <div>
              <Bone width={160} height={15} radius={5} />
              <Bone width={100} height={12} radius={4} style={{ marginTop: 6 }} />
            </div>
            <Bone width="100%" height={12} radius={4} />
            <Bone width="80%" height={12} radius={4} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: -6 }}>
                <Bone width={24} height={24} radius={12} />
              </div>
              <Bone width={64} height={28} radius={6} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function Bone({ width, height, radius, style }: {
  width: number | string; height: number; radius: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #2A2520 25%, #322D27 50%, #2A2520 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s ease infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}
