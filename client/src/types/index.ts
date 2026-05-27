export interface Product {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  supplier_name: string | null;
  expiration_date: string | null;
  low_stock_threshold: number;
  category?: string;
  image_path?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}
