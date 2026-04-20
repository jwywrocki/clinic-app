import { getDB } from '@/lib/db';
import { NewsManagement } from '../../components/NewsManagement';
import { saveNewsAction, deleteNewsAction } from '../../actions/news';
import { NewsItem } from '@/lib/types/news';

export default async function AdminNewsPage() {
  const db = getDB();

  const news = await db.findWhere<NewsItem>(
    'news',
    {},
    { orderBy: { column: 'created_at', ascending: false } }
  );

  return (
    <NewsManagement news={news as NewsItem[]} onSave={saveNewsAction} onDelete={deleteNewsAction} />
  );
}
