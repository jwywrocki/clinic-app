import { getDB } from '@/lib/db';
import { PagesManagement } from '../../components/PagesManagement';
import { savePageAction, deletePageAction } from '../../actions/pages';
import { Page } from '@/lib/types/pages';
import { Specialization } from '@/lib/types/specializations';

interface PageSpecializationLink {
  id: string;
  page_id: string;
  specialization_id: string;
}

export default async function AdminPagesPage() {
  const db = getDB();

  const pages = await db.findWhere<Page>(
    'pages',
    {},
    { orderBy: { column: 'updated_at', ascending: false } }
  );

  let links: PageSpecializationLink[] = [];
  let specializations: Specialization[] = [];
  try {
    links = await db.list<PageSpecializationLink>('page_has_specializations');
    specializations = await db.list<Specialization>('specializations', {
      orderBy: { column: 'name', ascending: true },
    });
  } catch {
    links = [];
    specializations = [];
  }

  const pagesWithSpecializations = pages.map(page => ({
    ...page,
    specialization_ids: links
      .filter(link => link.page_id === page.id)
      .map(link => link.specialization_id),
  }));

  return (
    <PagesManagement
      pages={pagesWithSpecializations as Page[]}
      specializations={specializations}
      onSave={savePageAction}
      onDelete={deletePageAction}
    />
  );
}
