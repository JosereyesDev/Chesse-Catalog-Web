"use server";

import { cookies } from "next/headers";

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });
}
