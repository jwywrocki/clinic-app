export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_published?: boolean;
  order_position?: number;
  created_at: string;
  updated_at: string;
}
