import { getDB } from '@/lib/db';
import { MenuManagement } from '../../components/MenuManagement';
import { saveMenuAction, updateMenuOrderAction, deleteMenuAction } from '../../actions/menus';
import { MenuItem } from '@/lib/types/menu';

export default async function AdminMenusPage() {
  const db = getDB();

  const menuItems = await db.findWhere<MenuItem>(
    'menu_items',
    {},
    { orderBy: { column: 'order_position', ascending: true } }
  );

  return (
    <MenuManagement
      menuItems={menuItems as MenuItem[]}
      onSave={saveMenuAction}
      onUpdateOrder={updateMenuOrderAction as any}
      onDelete={deleteMenuAction}
    />
  );
}
