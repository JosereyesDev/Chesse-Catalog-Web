import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inv. El Rey 2020 · Carrito de Lácteos",
  description: "Te ofrecemos los mejores productos lácteos del occidente de Falcón.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Kalam:wght@400;700&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" async></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
