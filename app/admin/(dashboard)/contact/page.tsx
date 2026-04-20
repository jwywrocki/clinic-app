import { ContactService } from '@/lib/services/contact';
import { ContactManagement } from '../../components/ContactManagement';
import {
  saveContactGroupAction,
  deleteContactGroupAction,
  deleteContactDetailAction,
  reorderContactGroupsAction,
} from '../../actions/contact';

export default async function AdminContactPage() {
  const contactGroups = await ContactService.getAllGroupsWithDetails();

  return (
    <ContactManagement
      contactGroups={contactGroups}
      onSaveGroup={saveContactGroupAction}
      onDeleteGroup={deleteContactGroupAction}
      onDeleteDetail={deleteContactDetailAction}
      onReorderGroups={reorderContactGroupsAction}
    />
  );
}
