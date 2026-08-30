import { createClient } from "@/utils/supabase/server";
import { Hero } from "@/components/Hero";
import { Catalog } from "@/components/Catalog";
import { About } from "@/components/About";
import { Location } from "@/components/Location";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order("id");

  // Fallback if no supabase config or empty
  const displayProducts =
    products && products.length > 0
      ? products
      : [
          { id: 1, name: "Queso Pasteurizado", description: "Barra de 3kg", base_price: 2.9, image: null, unit: "unit", weight_per_unit: 3, in_stock: true, category: "Quesos" },
          { id: 2, name: "Queso Mozzarella", description: "Barra de 1kg", base_price: 4.5, image: null, unit: "unit", weight_per_unit: 1, in_stock: true, category: "Quesos" },
        ];

  return (
    <CartProvider>
      <Hero />
      <Catalog products={displayProducts} />
      <About />
      <Location />
      <Contact />
      <Footer />
    </CartProvider>
  );
}
