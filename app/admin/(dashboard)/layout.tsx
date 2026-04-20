import { AdminLayoutClient } from './layout-client';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
