'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Notification {
  _id: string;
  memberName: string;
  projectName: string;
  projectId: string;
  action: 'created' | 'edited';
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const POLL_INTERVAL = 30_000;

export default function NotificationBell({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // skip this poll cycle on network error
    }
  }, []);

  // Polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    // Compute fixed position — open upward from the bell button's bottom edge
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: window.innerHeight - rect.bottom, // distance from viewport bottom
        left: rect.right + 8,
      });
    }
    setOpen(true);
    // Optimistic mark-all-read
    if (unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      }).catch(() => {});
    }
  };

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function getMessage(n: Notification): string {
    const verb = n.action === 'created' ? 'added an update to' : 'edited an update on';
    return `${n.memberName} ${verb} ${n.projectName}`;
  }

  return (
    <div ref={bellRef} style={{ position: 'relative' }}>
      {/* Bell button — full row when expanded, icon-only when collapsed */}
      <button
        onClick={handleToggle}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        style={{
          width: '100%',
          height: 36,
          borderRadius: 8,
          border: 'none',
          background: open ? 'rgba(196,149,106,0.1)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          padding: collapsed ? '0' : '0 10px',
          color: open ? '#C4956A' : '#DCCBB8',
          fontSize: 13,
          fontWeight: open ? 500 : 400,
          transition: 'background 0.15s, color 0.15s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = '#2A2520';
            e.currentTarget.style.color = '#F5EDE6';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#DCCBB8';
          }
        }}
      >
        {/* Icon wrapper */}
        <span
          style={{
            flexShrink: 0,
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <BellIcon />
          {/* Badge on icon (collapsed view) */}
          {collapsed && unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                background: '#C4553A',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px',
                border: '1.5px solid #1C1814',
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>

        {/* Label + badge (expanded view) */}
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  background: '#C4553A',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  flexShrink: 0,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Dropdown — fixed position to escape sidebar overflow:hidden */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: dropdownPos.top,
            left: dropdownPos.left,
            width: 300,
            background: '#221E19',
            border: '1px solid #2E2923',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '11px 14px 10px',
              borderBottom: '1px solid #2E2923',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F5EDE6' }}>
              Notifications
            </span>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#B5A795',
                  fontSize: 12,
                  padding: '24px 16px',
                  margin: 0,
                }}
              >
                No notifications yet
              </p>
            ) : (
              notifications.slice(0, 3).map((n, i) => (
                <Link
                  key={n._id}
                  href={`/projects/${n.projectId}`}
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: i < Math.min(notifications.length, 3) - 1 ? '1px solid #2E2923' : 'none',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    background: !n.read ? 'rgba(196,149,106,0.04)' : 'transparent',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2A2520'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? 'rgba(196,149,106,0.04)' : 'transparent'; }}
                >
                  {/* Member initial avatar */}
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3A2E26, #2A2018)',
                      border: '1px solid #3A332C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#C4956A',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {n.memberName.charAt(0).toUpperCase()}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: '#DCCBB8',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {getMessage(n)}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, color: '#B5A795' }}>
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#C4956A',
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5a4.5 4.5 0 00-4.5 4.5v2.75L2 11h12l-1.5-2.25V6A4.5 4.5 0 008 1.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 11.5a1.5 1.5 0 003 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
