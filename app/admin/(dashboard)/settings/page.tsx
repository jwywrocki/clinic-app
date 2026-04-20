import { Settings } from '../../components/Settings';
import { auth } from '@/lib/auth';

export default async function AdminSettingsPage() {
  const session = await auth();
  const currentUser = session?.user ? { id: session.user.id || 'unknown' } : null;

  return (
    <Settings
      currentUser={currentUser}
      onSave={async () => {
        'use server'; /* To be implemented */
      }}
    />
  );
}
