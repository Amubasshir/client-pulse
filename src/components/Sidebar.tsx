'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import logoImg from '../../public/pulse.png';

export interface SidebarUser {
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const MEMBER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { href: '/projects', label: 'Projects', icon: <FolderIcon /> },
];

const ADMIN_EXTRA: NavItem[] = [
  { href: '/team', label: 'Team', icon: <UsersIcon /> },
];

export default function Sidebar({ user }: { user: SidebarUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems =
    user.role === 'admin' ? [...MEMBER_NAV, ...ADMIN_EXTRA] : MEMBER_NAV;

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minWidth: collapsed ? 64 : 240,
        transition:
          'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        background: '#1C1814',
        borderRight: '1px solid #2E2923',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 18px',
          borderBottom: '1px solid #2E2923',
          gap: 10,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={logoImg}
          alt="ClientPulse logo"
          width={40}
          height={40}
          // style={{
          //   borderRadius: 7,
          //   flexShrink: 0,
          //   objectFit: 'cover',
          //   boxShadow: '0 2px 8px rgba(196,149,106,0.3)',
          // }}
        />
        {!collapsed && (
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#F5EDE6',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              font: 'sans-serif',
            }}
          >
            Client~Pulse
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <NavLink
              key={item.href}
              item={item}
              active={isActive}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* User + collapse toggle */}
      <div
        style={{ borderTop: '1px solid #2E2923', padding: 8, flexShrink: 0 }}
      >
        {/* User info */}
        {!collapsed && (
          <div
            style={{
              padding: '8px 10px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #3A2E26, #2A2018)',
                border: '1px solid #3A332C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#C4956A',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#F5EDE6',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: '#B5A795',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.role}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#A89888',
                padding: 4,
                borderRadius: 5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C4553A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#A89888';
              }}
            >
              <SignOutIcon />
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            height: 34,
            borderRadius: 7,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A89888',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2A2520';
            e.currentTarget.style.color = '#DCCBB8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#A89888';
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
    </aside>
  );
}

/* ── NavLink ─────────────────────────────────── */

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? 'rgba(196,149,106,0.1)'
    : hovered
      ? '#2A2520'
      : 'transparent';
  const color = active ? '#C4956A' : hovered ? '#F5EDE6' : '#DCCBB8';

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '9px 0' : '9px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 8,
        textDecoration: 'none',
        background: bg,
        color,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </span>
      {!collapsed && item.label}
    </Link>
  );
}

/* ── Icons ───────────────────────────────────── */

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M1 4a1 1 0 011-1h4.172a1 1 0 01.707.293L8 4.414V4a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M1 13c0-2.21 2.239-4 5-4s5 1.79 5 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M14 13c0-1.657-1.343-3-3-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
