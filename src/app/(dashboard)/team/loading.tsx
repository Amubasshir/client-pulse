export default function TeamLoading() {
  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <Bone width={120} height={22} radius={6} />
          <Bone width={160} height={13} radius={4} style={{ marginTop: 8 }} />
        </div>
        <Bone width={140} height={36} radius={8} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            background: '#221E19', border: '1px solid #2E2923',
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bone width={38} height={38} radius={19} />
              <div style={{ flex: 1 }}>
                <Bone width={120} height={14} radius={4} />
                <Bone width={160} height={12} radius={4} style={{ marginTop: 6 }} />
              </div>
              <Bone width={56} height={20} radius={10} />
            </div>
            <Bone width="100%" height={52} radius={8} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Bone width="50%" height={34} radius={7} />
              <Bone width="50%" height={34} radius={7} />
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
