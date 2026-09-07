import { createClient } from "@/utils/supabase/server";
import { AdminDashboard } from "./AdminDashboard";
import { redirect } from "next/navigation";

export const revalidate = 0; // No cachear la página de admin

export default async function AdminPage() {
  const supabase = await createClient();

  // Obtener productos
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("id");

  if (productsError) {
    console.error("Error fetching products", productsError);
  }

  // Obtener categorías (solo los nombres)
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("name");

  if (categoriesError) {
    console.error("Error fetching categories", categoriesError);
  }

  const categories = categoriesData?.map((c) => c.name) || [];

  return (
    <AdminDashboard
      initialProducts={products || []}
      initialCategories={categories}
    />
  );
}