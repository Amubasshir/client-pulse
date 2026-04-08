'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (!res?.ok) {
      setError('Invalid email or password.');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#12100E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>

      {/* Warm copper radial glow */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 72% 56% at 50% 38%, rgba(196,149,106,0.08) 0%, transparent 68%)',
      }} />

      {/* Dot grid texture */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.18,
        backgroundImage: 'radial-gradient(circle, #4A3F35 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 368, position: 'relative', zIndex: 1 }}>

        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #C4956A, #A07850)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(196,149,106,0.35)',
            }}>
              <PulseSVG />
            </span>
            <span style={{ fontSize: 19, fontWeight: 600, color: '#F0E6DC', letterSpacing: '-0.025em' }}>
              ClientPulse
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#7A6B5D', margin: 0 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#221E19',
          border: '1px solid #2E2923',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(196,149,106,0.1)',
        }}>
          {/* Copper top accent */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #C4956A 40%, #A07850 60%, transparent 100%)',
            opacity: 0.7,
          }} />

          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
              />
            </Field>

            {error && (
              <div style={{
                fontSize: 13, color: '#C4553A',
                background: 'rgba(196,85,58,0.08)',
                border: '1px solid rgba(196,85,58,0.22)',
                borderRadius: 8, padding: '9px 13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#8A6545' : '#C4956A',
                color: '#12100E',
                border: 'none',
                borderRadius: 9,
                padding: '11px 16px',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                transition: 'background 0.15s, box-shadow 0.15s',
                boxShadow: loading ? 'none' : '0 2px 12px rgba(196,149,106,0.25)',
                marginTop: 2,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D4A574'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C4956A'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#5A4F45', marginTop: 24 }}>
          No self-signup — contact your admin for access.
        </p>
      </div>
    </div>
  );
}

/* ── Small helpers ───────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 500, color: '#B8A898',
        textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1A1612',
  border: '1px solid #2E2923',
  borderRadius: 8,
  padding: '10px 13px',
  fontSize: 14,
  color: '#F0E6DC',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

function PulseSVG() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
      <path
        d="M1.5 8.5h2.8l1.7-4.5 3.2 9 2.3-6.5 1.5 2H15.5"
        stroke="#12100E"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
