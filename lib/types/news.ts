export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  excerpt?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}
