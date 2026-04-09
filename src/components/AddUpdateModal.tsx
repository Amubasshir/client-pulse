'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  projectId: string;
  projectName: string;
  clientName: string;
}

export default function AddUpdateModal({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    todayWork: '',
    tomorrowPlan: '',
    blockers: '',
    notes: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setForm({ todayWork: '', tomorrowPlan: '', blockers: '', notes: '' });
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todayWork: form.todayWork.trim(),
        tomorrowPlan: form.tomorrowPlan.trim(),
        ...(form.blockers.trim() && { blockers: form.blockers.trim() }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
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
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#D4A574'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#C4956A'; }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Update
      </button>

      {/* Backdrop + Modal */}
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
            width: '100%', maxWidth: 520,
            background: '#221E19',
            border: '1px solid #3A332C',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.64)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #2E2923',
            }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F5EDE6' }}>
                Add Update
              </h2>
              <button
                onClick={() => { reset(); setOpen(false); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#A89888', fontSize: 20, lineHeight: 1, padding: 2,
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

              <Field label="Today's Work *">
                <textarea
                  value={form.todayWork}
                  onChange={(e) => set('todayWork', e.target.value)}
                  required
                  rows={3}
                  placeholder="What did you accomplish today?"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Tomorrow's Plan *">
                <textarea
                  value={form.tomorrowPlan}
                  onChange={(e) => set('tomorrowPlan', e.target.value)}
                  required
                  rows={3}
                  placeholder="What will you work on tomorrow?"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Blockers">
                <textarea
                  value={form.blockers}
                  onChange={(e) => set('blockers', e.target.value)}
                  rows={2}
                  placeholder="Any blockers or dependencies? (optional)"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
                />
              </Field>

              <Field label="Internal Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={2}
                  placeholder="Team-only notes — never shown to the client (optional)"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, borderColor: '#3A2E26' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#A07850'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#3A2E26'; }}
                />
                <span style={{ fontSize: 11, color: '#A89888', marginTop: 2 }}>
                  Not included in client copy
                </span>
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
                  onClick={() => { reset(); setOpen(false); }}
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
                  {loading ? 'Posting…' : 'Post Update'}
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
  boxSizing: 'border-box',
};
