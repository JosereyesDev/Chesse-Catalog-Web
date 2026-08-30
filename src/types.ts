export interface Product {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image: string | null;
  unit: string;
  weight_per_unit: number;
  in_stock: boolean;
  category: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
