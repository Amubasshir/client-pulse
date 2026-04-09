'use client';

import Link from 'next/link';

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, color: '#B5A795', textDecoration: 'none',
        marginBottom: 20, transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#C4956A'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#B5A795'; }}
    >
      ← {label}
    </Link>
  );
}
