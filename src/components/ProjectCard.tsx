'use client';

import { useState } from 'react';
import Link from 'next/link';
import EditProjectModal from '@/components/EditProjectModal';
import type { ProjectData } from '@/app/(dashboard)/projects/page';

const STATUS_CONFIG = {
  active:    { label: 'Active',     dot: '#5D8C5A', bg: 'rgba(93,140,90,0.12)',   text: '#7DB87A' },
  'on-hold': { label: 'On Hold',    dot: '#A07850', bg: 'rgba(160,120,80,0.12)',  text: '#C4956A' },
  completed: { label: 'Completed',  dot: '#7A9BB5', bg: 'rgba(122,155,181,0.12)', text: '#9BBDD4' },
} as const;

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  fiverr:   'Fiverr',
  upwork:   'Upwork',
  other:    'Other',
};

interface Props {
  project: ProjectData;
  isAdmin?: boolean;
}

export default function ProjectCard({ project, isAdmin }: Props) {
  const status = STATUS_CONFIG[project.status];
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div style={{
        background: '#221E19',
        border: '1px solid #2E2923',
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'inset 0 1px 0 rgba(196,149,106,0.06)',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3A332C'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2E2923'; }}
      >
        {/* Top row: status + platform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {/* Status badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: status.bg, borderRadius: 20, padding: '3px 9px',
            fontSize: 11, fontWeight: 500, color: status.text,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.dot, flexShrink: 0 }} />
            {status.label}
          </span>

          {/* Platform */}
          <span style={{
            fontSize: 11, fontWeight: 500, color: '#7A6B5D',
            background: '#1C1814', border: '1px solid #2E2923',
            borderRadius: 6, padding: '3px 8px',
          }}>
            {PLATFORM_LABEL[project.platform] ?? project.platform}
          </span>
        </div>

        {/* Name + client */}
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 600, color: '#F0E6DC', letterSpacing: '-0.015em' }}>
            {project.name}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#7A6B5D' }}>
            {project.clientName}
          </p>
        </div>

        {/* Description */}
        {project.description && (
          <p style={{
            margin: 0, fontSize: 12, color: '#B8A898',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            lineHeight: 1.5,
          }}>
            {project.description}
          </p>
        )}

        {/* Footer: members + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          {/* Member avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {project.assignedMembers.slice(0, 4).map((m, i) => (
              <span
                key={m._id}
                title={m.name}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `hsl(${(m.name.charCodeAt(0) * 17) % 360}, 25%, 28%)`,
                  border: '2px solid #221E19',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: '#C4956A',
                  marginLeft: i === 0 ? 0 : -6,
                  position: 'relative', zIndex: 4 - i,
                }}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
            ))}
            {project.assignedMembers.length > 4 && (
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#2A2520', border: '2px solid #221E19',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#7A6B5D', marginLeft: -6, fontWeight: 500,
              }}>
                +{project.assignedMembers.length - 4}
              </span>
            )}
            {project.assignedMembers.length === 0 && (
              <span style={{ fontSize: 11, color: '#5A4F45' }}>No members</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isAdmin && (
              <button
                onClick={() => setEditOpen(true)}
                style={{
                  fontSize: 12, color: '#7A6B5D', fontWeight: 500,
                  textDecoration: 'none', padding: '4px 10px',
                  background: 'none',
                  border: '1px solid #2E2923',
                  borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A332C'; e.currentTarget.style.color = '#B8A898'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2E2923'; e.currentTarget.style.color = '#7A6B5D'; }}
              >
                Edit
              </button>
            )}
            <Link
              href={`/projects/${project._id}`}
              style={{
                fontSize: 12, color: '#C4956A', fontWeight: 500,
                textDecoration: 'none', padding: '4px 10px',
                background: 'rgba(196,149,106,0.08)',
                borderRadius: 6, transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,149,106,0.16)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,149,106,0.08)'; }}
            >
              View →
            </Link>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
