import { getDB } from '@/lib/db';
import { ServicesManagement } from '../../components/ServicesManagement';
import { saveServiceAction, deleteServiceAction, reorderServiceAction } from '../../actions/services';
import { Service } from '@/lib/types/services';

export default async function AdminServicesPage() {
  const db = getDB();

  const services = await db.findWhere<Service>(
    'services',
    {},
    { orderBy: { column: 'order_position', ascending: true } }
  );

  return (
    <ServicesManagement
      services={services as Service[]}
      onSave={saveServiceAction}
      onDelete={deleteServiceAction}
      onReorder={reorderServiceAction}
    />
  );
}
