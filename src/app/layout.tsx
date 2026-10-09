import type { Metadata } from "next";
import "./globals.css";

// Definición de URL base para resolver URLs absolutas en imágenes y canonicals
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inv-elrey2020.vercel.app"; // Cambia por tu dominio real

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Inv. El Rey 2020 | Lácteos y Quesos en Falcón",
    template: "%s | Inv. El Rey 2020",
  },
  description:
    "Venta de los mejores productos lácteos y quesos autóctonos del occidente de Falcón. Envíos directos y atención al mayor y detal.",
  keywords: [
    "Lácteos Falcón",
    "Queso de mano",
    "Queso duro Falcón",
    "Inversiones El Rey 2020",
    "Mene Mauroa lacteos",
    "Venta de queso al mayor Venezuela",
    "Lácteos de calidad",
  ],
  authors: [{ name: "Inv. El Rey 2020" }],
  creator: "Inv. El Rey 2020",
  publisher: "Inv. El Rey 2020",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Configuración de tarjetas cuando se comparte en WhatsApp / Facebook
  openGraph: {
    title: "Inv. El Rey 2020 | Lácteos del Occidente de Falcón",
    description:
      "Catálogo de lácteos y quesos frescos. Haz tu pedido directo por WhatsApp con la mejor calidad de Falcón.",
    url: siteUrl,
    siteName: "Inv. El Rey 2020",
    images: [
      {
        url: "/og-image.jpg", // Asegúrate de colocar una imagen atractiva de 1200x630 px en la carpeta public/
        width: 1200,
        height: 630,
        alt: "Catálogo de productos lácteos Inv. El Rey 2020",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  // Configuración de tarjetas en X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Inv. El Rey 2020 | Lácteos de Falcón",
    description:
      "Catálogo de lácteos y quesos frescos. Haz tu pedido directo por WhatsApp.",
    images: ["/og-image.jpg"],
  },
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Kalam:wght@400;700&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          async
        ></script>
      </head>
      <body>
        {/* Datos estructurados JSON-LD para Google My Business / Comercio Local */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Inversiones El Rey 2020",
              image: `${siteUrl}/og-image.jpg`,
              description:
                "Distribución de productos lácteos y quesos frescos del occidente de Falcón.",
              address: {
                "@type": "PostalAddress",
                addressRegion: "Falcón",
                addressCountry: "VE",
              },
              priceRange: "$$",
              currenciesAccepted: "USD, VES",
              paymentAccepted: "Cash, Crypto, Transfer",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}