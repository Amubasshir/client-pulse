'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UpdateData } from '@/app/(dashboard)/projects/[id]/page';

interface Props {
  update: UpdateData;
  projectName: string;
  clientName: string;
  currentUserId: string;
  currentUserRole: 'admin' | 'member';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

function buildClientCopy(update: UpdateData, projectName: string, clientName: string): string {
  const date = formatDate(update.date);
  const lines = [
    `📅 ${date}`,
    `Project: ${projectName} | Client: ${clientName}`,
    '',
    `✅ Today's Work:`,
    update.content.todayWork,
    '',
    `📋 Tomorrow's Plan:`,
    update.content.tomorrowPlan,
  ];
  if (update.content.blockers) {
    lines.push('', `⚠️ Blockers:`, update.content.blockers);
  }
  // notes are NEVER included
  return lines.join('\n');
}

export default function UpdateCard({ update, projectName, clientName, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const isOwn = update.author._id === currentUserId;
  const canEdit = currentUserRole === 'admin' || isOwn;

  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleCopy() {
    const text = buildClientCopy(update, projectName, clientName);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/updates/${update._id}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <div style={{
        background: '#2D2820',
        border: '1px solid #2E2923',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px',
          borderBottom: '1px solid #2E2923',
          background: '#252019',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Author avatar */}
            <span style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: `hsl(${(update.author.name.charCodeAt(0) * 17) % 360}, 28%, 36%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#C4956A',
            }}>
              {update.author.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#F5EDE6' }}>
                {update.author.name}
              </span>
              <span style={{ fontSize: 11, color: '#A89888', marginLeft: 6 }}>
                {formatDate(update.date)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ActionBtn
              onClick={handleCopy}
              label={copied ? '✓ Copied' : 'Copy for Client'}
              variant="copper"
            />
            {canEdit && (
              <ActionBtn
                onClick={() => setEditOpen(true)}
                label="Edit"
                variant="ghost"
              />
            )}
            {canEdit && (
              <ActionBtn
                onClick={() => setDeleteOpen(true)}
                label="Delete"
                variant="danger"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Section label="Today's Work" color="#7DB87A">
            {update.content.todayWork}
          </Section>

          <Section label="Tomorrow's Plan" color="#9BBDD4">
            {update.content.tomorrowPlan}
          </Section>

          {update.content.blockers && (
            <Section label="Blockers" color="#C4953A">
              {update.content.blockers}
            </Section>
          )}

          {update.content.notes && (
            <div style={{
              background: 'rgba(160,120,80,0.06)',
              border: '1px solid rgba(160,120,80,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#A07850', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Internal Note
                </span>
                <span style={{
                  fontSize: 9, color: '#B5A795', background: '#1C1814',
                  border: '1px solid #2E2923', borderRadius: 4, padding: '1px 5px',
                }}>
                  Not sent to client
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#DCCBB8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {update.content.notes}
              </p>
            </div>
          )}

        </div>
      </div>

      {editOpen && (
        <EditModal
          update={update}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); router.refresh(); }}
        />
      )}

      {deleteOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(12,10,8,0.76)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 400,
            background: '#2D2820',
            border: '1px solid #3A332C',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.64)',
          }}>
            {/* Header */}
            <div style={{ padding: '22px 24px 0', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 14px',
                background: 'rgba(196,85,58,0.1)',
                border: '1px solid rgba(196,85,58,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                🗑️
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#F5EDE6' }}>
                Delete Update?
              </h2>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: '#B5A795', lineHeight: 1.5 }}>
                This update by <strong style={{ color: '#DCCBB8' }}>{update.author.name}</strong> on{' '}
                <strong style={{ color: '#DCCBB8' }}>{new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong> will be permanently removed.
              </p>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: 10, padding: '0 24px 22px',
            }}>
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                style={{
                  flex: 1, background: 'none', border: '1px solid #3A332C',
                  borderRadius: 8, padding: '10px 0',
                  fontSize: 13, color: '#DCCBB8', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A89888'; e.currentTarget.style.color = '#F5EDE6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4A4038'; e.currentTarget.style.color = '#DCCBB8'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, background: '#C4553A', border: 'none',
                  borderRadius: 8, padding: '10px 0',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: deleting ? 0.7 : 1,
                  transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#D4644A'; }}
                onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = '#C4553A'; }}
              >
                {deleting ? (
                  <>
                    <span style={{
                      width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Deleting…
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Section ─────────────────────────────────── */

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={{
        display: 'inline-block', fontSize: 10, fontWeight: 600,
        color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
      }}>
        {label}
      </span>
      <p style={{ margin: 0, fontSize: 13, color: '#EDE4D8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {children}
      </p>
    </div>
  );
}

/* ── ActionBtn ───────────────────────────────── */

function ActionBtn({
  onClick, label, variant, disabled,
}: {
  onClick: () => void;
  label: string;
  variant: 'copper' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    copper: {
      background: 'rgba(196,149,106,0.1)', color: '#C4956A',
      border: '1px solid rgba(196,149,106,0.25)',
    },
    ghost: {
      background: 'transparent', color: '#B5A795',
      border: '1px solid #2E2923',
    },
    danger: {
      background: 'transparent', color: '#B5A795',
      border: '1px solid #2E2923',
    },
  };

  const hoverStyles: Record<string, Partial<React.CSSProperties>> = {
    copper: { background: 'rgba(196,149,106,0.18)', color: '#D4A574', borderColor: 'rgba(196,149,106,0.4)' },
    ghost: { background: '#342E27', color: '#DCCBB8', borderColor: '#4A4038' },
    danger: { background: 'rgba(196,85,58,0.08)', color: '#C4553A', borderColor: 'rgba(196,85,58,0.3)' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 7, padding: '5px 11px',
        fontSize: 11, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, styles[variant]);
        }
      }}
    >
      {label}
    </button>
  );
}

/* ── EditModal ───────────────────────────────── */

function EditModal({
  update,
  onClose,
  onSaved,
}: {
  update: UpdateData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    todayWork: update.content.todayWork,
    tomorrowPlan: update.content.tomorrowPlan,
    blockers: update.content.blockers ?? '',
    notes: update.content.notes ?? '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/updates/${update._id}`, {
      method: 'PATCH',
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

    onSaved();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(12,10,8,0.76)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#2D2820',
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
            Edit Update
          </h2>
          <button
            onClick={onClose}
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

          <EditField label="Today's Work *">
            <textarea
              value={form.todayWork}
              onChange={(e) => set('todayWork', e.target.value)}
              required rows={3}
              style={{ ...editInputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#3C3328'; }}
            />
          </EditField>

          <EditField label="Tomorrow's Plan *">
            <textarea
              value={form.tomorrowPlan}
              onChange={(e) => set('tomorrowPlan', e.target.value)}
              required rows={3}
              style={{ ...editInputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#3C3328'; }}
            />
          </EditField>

          <EditField label="Blockers">
            <textarea
              value={form.blockers}
              onChange={(e) => set('blockers', e.target.value)}
              rows={2}
              style={{ ...editInputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#3C3328'; }}
            />
          </EditField>

          <EditField label="Internal Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              style={{ ...editInputStyle, resize: 'vertical', lineHeight: 1.6, borderColor: '#3A2E26' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#A07850'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#3A2E26'; }}
            />
          </EditField>

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
              type="button" onClick={onClose}
              style={{
                background: 'none', border: '1px solid #3A332C', borderRadius: 8,
                padding: '9px 18px', fontSize: 13, color: '#DCCBB8', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A89888'; e.currentTarget.style.color = '#F5EDE6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4A4038'; e.currentTarget.style.color = '#DCCBB8'; }}
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
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
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

const editInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#221C16',
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
