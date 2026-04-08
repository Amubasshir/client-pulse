'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Props {
  projectId: string;
  assignedMemberIds: string[];
  allMembers: Member[];
}

export default function AssignMembersModal({ projectId, assignedMemberIds, allMembers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedMemberIds));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleOpen() {
    setSelected(new Set(assignedMemberIds));
    setError('');
    setOpen(true);
  }

  async function handleSave() {
    setError('');
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedMembers: Array.from(selected) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          background: 'none', border: '1px solid #3A332C',
          borderRadius: 7, padding: '6px 12px',
          fontSize: 12, color: '#B8A898', cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.color = '#C4956A'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B8A898'; }}
      >
        Assign Members
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
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 420,
            background: '#221E19', border: '1px solid #3A332C',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.64)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: '1px solid #2E2923',
            }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F0E6DC' }}>
                Assign Members
              </h2>
              <button
                onClick={() => setOpen(false)}
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

            {/* Member list */}
            <div style={{ padding: '12px 16px', maxHeight: 320, overflowY: 'auto' }}>
              {allMembers.length === 0 ? (
                <p style={{ margin: '20px 0', textAlign: 'center', fontSize: 13, color: '#5A4F45' }}>
                  No team members yet. Add members on the Team page first.
                </p>
              ) : (
                allMembers.map((m) => {
                  const isChecked = selected.has(m._id);
                  return (
                    <label
                      key={m._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 10px', borderRadius: 8, cursor: 'pointer',
                        background: isChecked ? 'rgba(196,149,106,0.06)' : 'transparent',
                        border: `1px solid ${isChecked ? 'rgba(196,149,106,0.2)' : 'transparent'}`,
                        marginBottom: 4, transition: 'all 0.15s',
                      }}
                    >
                      {/* Custom checkbox */}
                      <span
                        onClick={() => toggle(m._id)}
                        style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${isChecked ? '#C4956A' : '#3A332C'}`,
                          background: isChecked ? '#C4956A' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', cursor: 'pointer',
                        }}
                      >
                        {isChecked && (
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#12100E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>

                      {/* Avatar */}
                      <span
                        onClick={() => toggle(m._id)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${(m.name.charCodeAt(0) * 17) % 360}, 22%, 26%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#C4956A',
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </span>

                      {/* Name + email */}
                      <div style={{ flex: 1, minWidth: 0 }} onClick={() => toggle(m._id)}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#F0E6DC' }}>
                          {m.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: '#5A4F45', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.email}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {error && (
              <div style={{
                margin: '0 16px',
                fontSize: 13, color: '#C4553A',
                background: 'rgba(196,85,58,0.08)',
                border: '1px solid rgba(196,85,58,0.22)',
                borderRadius: 8, padding: '9px 13px',
              }}>
                {error}
              </div>
            )}

            {/* Footer */}
            <div style={{
              display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 24px', borderTop: '1px solid #2E2923', marginTop: 8,
            }}>
              <span style={{ fontSize: 12, color: '#5A4F45' }}>
                {selected.size} selected
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: '1px solid #3A332C', borderRadius: 8,
                    padding: '8px 16px', fontSize: 13, color: '#B8A898',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5A4F45'; e.currentTarget.style.color = '#F0E6DC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B8A898'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave} disabled={loading}
                  style={{
                    background: loading ? '#8A6545' : '#C4956A', color: '#12100E',
                    border: 'none', borderRadius: 8, padding: '8px 18px',
                    fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D4A574'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C4956A'; }}
                >
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
