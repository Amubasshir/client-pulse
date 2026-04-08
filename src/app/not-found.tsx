import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#12100E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{
          margin: '0 0 12px',
          fontSize: 64,
          fontWeight: 700,
          color: '#2E2923',
          letterSpacing: '-0.05em',
          lineHeight: 1,
        }}>
          404
        </p>
        <h1 style={{
          margin: '0 0 10px',
          fontSize: 20,
          fontWeight: 600,
          color: '#F0E6DC',
          letterSpacing: '-0.02em',
        }}>
          Page not found
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 13, color: '#7A6B5D', lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#C4956A',
            color: '#12100E',
            textDecoration: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(196,149,106,0.2)',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
