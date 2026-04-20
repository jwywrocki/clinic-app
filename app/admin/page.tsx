import { redirect } from 'next/navigation';

/**
 * The root /admin route redirects to the dashboard.
 * All admin UI lives under /admin/(dashboard)/* routes,
 * each loading only their own data as Server Components.
 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}
