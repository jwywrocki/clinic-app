import { getDB } from '@/lib/db';
import { UserService } from '@/lib/services/users';
import { UsersManagement } from '../../components/UsersManagement';
import { saveUserAction, deleteUserAction } from '../../actions/users';

export default async function AdminUsersPage() {
  const db = getDB();

  const users = await UserService.getAllUsersWithRoles();
  const roles = await db.findWhere('roles', {});

  return (
    <UsersManagement
      users={users as any}
      roles={roles as any}
      onSave={saveUserAction}
      onDelete={deleteUserAction}
      currentUser={null}
    />
  );
}
