import { AdminLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
