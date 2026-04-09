'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MemberData } from '@/app/(dashboard)/team/page';

interface Props {
  member: MemberData;
  currentUserId: string;
  isLastAdmin: boolean;
}

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  bg: 'rgba(196,149,106,0.1)',  text: '#C4956A',  border: 'rgba(196,149,106,0.25)' },
  member: { label: 'Member', bg: 'rgba(184,168,152,0.08)', text: '#DCCBB8',  border: 'rgba(184,168,152,0.2)'  },
};

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function MemberCard({ member, currentUserId, isLastAdmin }: Props) {
  const router = useRouter();
  const isSelf = member._id === currentUserId;
  const canDelete = !isSelf && !isLastAdmin;

  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const role = ROLE_CONFIG[member.role];

  async function handleDelete() {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/users/${member._id}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div style={{
        background: '#221E19',
        border: '1px solid #2E2923',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'inset 0 1px 0 rgba(196,149,106,0.05)',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3A332C'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2E2923'; }}
      >
        {/* Top: avatar + name + role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${(member.name.charCodeAt(0) * 17) % 360}, 22%, 26%)`,
            border: '1px solid #3A332C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#C4956A',
          }}>
            {member.name.charAt(0).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#F5EDE6', letterSpacing: '-0.01em' }}>
                {member.name}
              </span>
              {isSelf && (
                <span style={{ fontSize: 10, color: '#B5A795', background: '#1C1814', border: '1px solid #2E2923', borderRadius: 4, padding: '1px 6px' }}>
                  you
                </span>
              )}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#B5A795', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.email}
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 9px',
            borderRadius: 20, border: `1px solid ${role.border}`,
            background: role.bg, color: role.text,
            flexShrink: 0,
          }}>
            {role.label}
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px',
          background: '#1A1612', borderRadius: 8,
          border: '1px solid #252018',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#C4956A' }}>
              {member.projectCount}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 10, color: '#A89888' }}>
              {member.projectCount === 1 ? 'Project' : 'Projects'}
            </p>
          </div>
          <div style={{ width: 1, height: 28, background: '#2E2923' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#DCCBB8' }}>
              {formatJoined(member.createdAt)}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 10, color: '#A89888' }}>
              Joined
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              flex: 1, background: 'none', border: '1px solid #3A332C',
              borderRadius: 7, padding: '7px 0', fontSize: 12,
              color: '#DCCBB8', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A89888'; e.currentTarget.style.color = '#F5EDE6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#DCCBB8'; }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            title={isSelf ? 'Cannot delete your own account' : isLastAdmin ? 'Cannot delete the only admin' : undefined}
            style={{
              flex: 1, background: 'none',
              border: `1px solid ${canDelete ? '#3A332C' : '#252018'}`,
              borderRadius: 7, padding: '7px 0', fontSize: 12,
              color: canDelete ? '#B5A795' : '#3A332C',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'all 0.15s',
              opacity: deleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (canDelete) { e.currentTarget.style.borderColor = 'rgba(196,85,58,0.4)'; e.currentTarget.style.color = '#C4553A'; } }}
            onMouseLeave={(e) => { if (canDelete) { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B5A795'; } }}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {editOpen && (
        <EditMemberModal
          member={member}
          isLastAdmin={isLastAdmin}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); router.refresh(); }}
        />
      )}
    </>
  );
}

/* ── EditMemberModal ─────────────────────────── */

function EditMemberModal({
  member, isLastAdmin, onClose, onSaved,
}: {
  member: MemberData;
  isLastAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    role: member.role,
    password: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/users/${member._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        ...(form.password && { password: form.password }),
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
        width: '100%', maxWidth: 440,
        background: '#221E19', border: '1px solid #3A332C',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.64)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #2E2923',
        }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F5EDE6' }}>
            Edit Member
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

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <EField label="Full Name *">
            <input
              value={form.name} onChange={(e) => set('name', e.target.value)}
              required style={eInputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
            />
          </EField>

          <EField label="Email *">
            <input
              type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              required style={eInputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
            />
          </EField>

          <EField label="Role">
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              disabled={isLastAdmin && member.role === 'admin'}
              style={{ ...eInputStyle, cursor: isLastAdmin && member.role === 'admin' ? 'not-allowed' : 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            {isLastAdmin && member.role === 'admin' && (
              <span style={{ fontSize: 11, color: '#A89888' }}>Cannot demote the only admin</span>
            )}
          </EField>

          <EField label="New Password">
            <input
              type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder="Leave blank to keep current"
              minLength={6}
              style={eInputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C4956A'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2E2923'; }}
            />
          </EField>

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
                padding: '9px 18px', fontSize: 13, color: '#DCCBB8',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A89888'; e.currentTarget.style.color = '#F5EDE6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#DCCBB8'; }}
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

function EField({ label, children }: { label: string; children: React.ReactNode }) {
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

const eInputStyle: React.CSSProperties = {
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
