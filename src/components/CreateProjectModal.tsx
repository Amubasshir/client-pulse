'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLATFORMS = ['whatsapp', 'fiverr', 'upwork', 'other'] as const;
const STATUSES  = ['active', 'on-hold', 'completed'] as const;

export default function CreateProjectModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    clientName: '',
    platform: 'other' as typeof PLATFORMS[number],
    platformLink: '',
    status: 'active' as typeof STATUSES[number],
    description: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        clientName: form.clientName.trim(),
        platform: form.platform,
        ...(form.platformLink.trim() && { platformLink: form.platformLink.trim() }),
        status: form.status,
        ...(form.description.trim() && { description: form.description.trim() }),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    // Reset form and close
    setForm({ name: '', clientName: '', platform: 'other', platformLink: '', status: 'active', description: '' });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Trigger */}
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
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Project
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(12,10,8,0.72)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 480,
            background: '#221E19',
            border: '1px solid #3A332C',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #2E2923',
            }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F5EDE6' }}>
                New Project
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#A89888', fontSize: 18, lineHeight: 1, padding: 2,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#DCCBB8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#A89888'; }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              <Row>
                <Field label="Project Name *">
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    required placeholder="e.g. Website Redesign"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                  />
                </Field>
                <Field label="Client Name *">
                  <input
                    value={form.clientName}
                    onChange={(e) => set('clientName', e.target.value)}
                    required placeholder="e.g. Acme Corp"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                  />
                </Field>
              </Row>

              <Row>
                <Field label="Platform *">
                  <select
                    value={form.platform}
                    onChange={(e) => set('platform', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
              </Row>

              <Field label="Platform Link">
                <input
                  type="url"
                  value={form.platformLink}
                  onChange={(e) => set('platformLink', e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Brief project description…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
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

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: '1px solid #3A332C',
                    borderRadius: 8, padding: '9px 18px',
                    fontSize: 13, color: '#DCCBB8', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A89888'; e.currentTarget.style.color = '#F5EDE6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#DCCBB8'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#8A6545' : '#C4956A',
                    color: '#12100E', border: 'none', borderRadius: 8,
                    padding: '9px 20px', fontSize: 13, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D4A574'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C4956A'; }}
                >
                  {loading ? 'Creating…' : 'Create Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Helpers ─────────────────────────────────── */

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 500, color: '#DCCBB8',
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
  color: '#F5EDE6',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
