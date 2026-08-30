import { createClient } from "@/utils/supabase/server";
import { AdminDashboard } from "./AdminDashboard";
import { redirect } from "next/navigation";

export const revalidate = 0; // Don't cache admin page

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from('products').select('*').order('id');
  
  if (error) {
    console.error("Error fetching products", error);
  }

  return <AdminDashboard initialProducts={products || []} />;
}
