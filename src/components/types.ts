export interface Product {
  id: number;
  name: string;
  description: string;
  base_price: number;
  image: string | null;
  unit: "kg" | "unit";
  weight_per_unit: number;
  in_stock: boolean;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerData {
  name: string;
  cedula: string;
  phone: string;
  address: string;
}
