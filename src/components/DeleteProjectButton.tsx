'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProjectButton({ projectId, projectName }: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${projectName}"? All updates for this project will also be lost. This cannot be undone.`)) return;

    setDeleting(true);
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    setDeleting(false);

    if (res.ok) {
      router.push('/projects');
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      style={{
        background: 'none',
        border: '1px solid rgba(196,85,58,0.3)',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 13, fontWeight: 500,
        color: '#C4553A',
        cursor: deleting ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        opacity: deleting ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!deleting) {
          e.currentTarget.style.background = 'rgba(196,85,58,0.1)';
          e.currentTarget.style.borderColor = 'rgba(196,85,58,0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (!deleting) {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.borderColor = 'rgba(196,85,58,0.3)';
        }
      }}
    >
      {deleting ? 'Deleting…' : 'Delete Project'}
    </button>
  );
}
