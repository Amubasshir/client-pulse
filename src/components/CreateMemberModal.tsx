'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['member', 'admin'] as const;

export default function CreateMemberModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as typeof ROLES[number],
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setForm({ name: '', email: '', password: '', role: 'member' });
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#C4956A', color: '#12100E',
          border: 'none', borderRadius: 8,
          padding: '9px 16px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 2px 10px rgba(196,149,106,0.2)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#D4A574'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#C4956A'; }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Member
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(12,10,8,0.76)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { reset(); setOpen(false); } }}
        >
          <div style={{
            width: '100%', maxWidth: 440,
            background: '#221E19',
            border: '1px solid #3A332C',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.64)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: '1px solid #2E2923',
            }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F0E6DC' }}>
                Add Member
              </h2>
              <button
                onClick={() => { reset(); setOpen(false); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#5A4F45', fontSize: 20, lineHeight: 1, padding: 2,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#B8A898'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5A4F45'; }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              <Field label="Full Name *">
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required placeholder="e.g. Jane Smith"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Email *">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required placeholder="jane@example.com"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Password *">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required minLength={6}
                  placeholder="Min. 6 characters"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
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

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { reset(); setOpen(false); }}
                  style={{
                    background: 'none', border: '1px solid #3A332C', borderRadius: 8,
                    padding: '9px 18px', fontSize: 13, color: '#B8A898',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5A4F45'; e.currentTarget.style.color = '#F0E6DC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B8A898'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  style={{
                    background: loading ? '#8A6545' : '#C4956A', color: '#12100E',
                    border: 'none', borderRadius: 8, padding: '9px 20px',
                    fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D4A574'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C4956A'; }}
                >
                  {loading ? 'Creating…' : 'Create Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

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
  padding: '9px 12px',
  fontSize: 13,
  color: '#F0E6DC',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
