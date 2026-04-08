import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = {
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    role: (session.user.role ?? 'member') as 'admin' | 'member',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#12100E' }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
