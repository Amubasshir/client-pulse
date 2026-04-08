'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProjectButton({ projectId, projectName }: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      setOpen(false);
      router.push('/projects');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          background: 'none',
          border: '1px solid rgba(196,85,58,0.3)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 12, fontWeight: 500,
          color: '#C4553A',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(196,85,58,0.1)';
          e.currentTarget.style.borderColor = 'rgba(196,85,58,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.borderColor = 'rgba(196,85,58,0.3)';
        }}
      >
        Delete Project
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(12,10,8,0.8)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setOpen(false); }}
        >
          <div style={{
            width: '100%', maxWidth: 420,
            background: '#221E19',
            border: '1px solid #3A332C',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}>
            {/* Icon + header */}
            <div style={{ padding: '28px 28px 0' }}>
              {/* Danger icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(196,85,58,0.12)',
                border: '1px solid rgba(196,85,58,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, fontSize: 20,
              }}>
                🗑
              </div>
              <h2 style={{
                margin: '0 0 8px', fontSize: 16, fontWeight: 700,
                color: '#F0E6DC', letterSpacing: '-0.02em',
              }}>
                Delete project?
              </h2>
              <p style={{
                margin: 0, fontSize: 13, color: '#7A6B5D', lineHeight: 1.6,
              }}>
                <span style={{ color: '#B8A898', fontWeight: 500 }}>&ldquo;{projectName}&rdquo;</span>
                {' '}and all its updates will be permanently deleted. This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: 10,
              padding: '24px 28px 28px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                style={{
                  background: 'none',
                  border: '1px solid #3A332C',
                  borderRadius: 8, padding: '9px 20px',
                  fontSize: 13, color: '#B8A898',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  opacity: deleting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!deleting) { e.currentTarget.style.borderColor = '#5A4F45'; e.currentTarget.style.color = '#F0E6DC'; } }}
                onMouseLeave={(e) => { if (!deleting) { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B8A898'; } }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={deleting}
                style={{
                  background: deleting ? 'rgba(196,85,58,0.5)' : '#C4553A',
                  border: 'none', borderRadius: 8,
                  padding: '9px 20px',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#D4654A'; }}
                onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = '#C4553A'; }}
              >
                {deleting ? (
                  <>
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Deleting…
                  </>
                ) : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
