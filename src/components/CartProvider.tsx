"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CartItem, Product } from "@/types";
import { Navbar } from "@/components/Navbar";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductModal } from "@/components/ProductModal";
import { CustomerModal } from "@/components/CustomerModal";

export interface CustomerData {
  name?: string;
  address?: string;
  cedula?: string;
  phone?: string;
}

declare global {
  interface Window {
    jspdf: any;
  }
}

const CART_STORAGE_KEY = "lacteos_cart_v1";
const CUSTOMER_STORAGE_KEY = "lacteos_customer_v1";
const WHATSAPP_NUMBER = "584121234253";

const CartContext = createContext<{
  cart: CartItem[];
  openProductModal: (product: Product) => void;
}>({
  cart: [],
  openProductModal: () => {},
});

export const useCart = () => useContext(CartContext);

function cleanTextForPDF(text: string) {
  if (!text) return "";
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ú: "u",
    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U",
    ñ: "n", Ñ: "N", ü: "u", Ü: "U",
  };
  return text.replace(/[áéíóúÁÉÍÓÚñÑüÜ]/g, (c) => map[c] || c);
}

function generateOrderPDF(cart: CartItem[], customerData: CustomerData) {
  if (cart.length === 0 || typeof window === "undefined" || !window.jspdf) return null;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  const writeText = (text: string, x: number, y: number, options: any = {}) => {
    doc.text(cleanTextForPDF(text), x, y, options);
  };

  doc.setFillColor(19, 42, 99);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFillColor(255, 199, 44);
  doc.rect(0, 0, pageWidth, 4, "F");

  const logoX = margin;
  const logoY = 10;
  const logoRadius = 14;
  doc.setFillColor(255, 199, 44);
  doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius, "F");
  doc.setFillColor(19, 42, 99);
  doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius - 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  writeText("INV. EL REY", logoX + 35, logoY + 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 199, 44);
  writeText("LACTEOS DE FALCON . 2020", logoX + 35, logoY + 24);
  doc.setDrawColor(255, 199, 44);
  doc.setLineWidth(0.5);
  doc.line(margin, logoY + 32, pageWidth - margin, logoY + 32);

  const now = new Date();
  const fecha = now.toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const today = now.toISOString().slice(0, 10).replace(/-/g, "");
  const orderId = `PD-${today}-${orderNumber}`;

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  writeText(`Pedido: ${orderId}`, pageWidth - margin - 5, logoY + 5, { align: "right" });
  doc.setFont("helvetica", "normal");
  writeText(`Fecha: ${fecha}`, pageWidth - margin - 5, logoY + 16, { align: "right" });

  y = 62;
  doc.setDrawColor(19, 42, 99);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  if (customerData.name || customerData.address || customerData.cedula || customerData.phone) {
    doc.setFillColor(245, 250, 247);
    doc.setDrawColor(43, 122, 98);
    doc.setLineWidth(0.3);
    const custBoxHeight = 32;
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, custBoxHeight, 2, 2, "FD");
    doc.setTextColor(19, 42, 99);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    writeText("DATOS DEL CLIENTE", margin + 4, y + 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    let custY = y + 7;
    if (customerData.name) { writeText(`Nombre: ${customerData.name}`, margin + 4, custY); custY += 5; }
    if (customerData.cedula) { writeText(`Cedula: ${customerData.cedula}`, margin + 4, custY); custY += 5; }
    if (customerData.address) { writeText(`Direccion: ${customerData.address}`, margin + 4, custY); custY += 5; }
    if (customerData.phone) { writeText(`Telefono: ${customerData.phone}`, margin + 4, custY); custY += 5; }
    y += custBoxHeight + 10;
  }

  const drawTableHeader = () => {
    doc.setFillColor(240, 245, 248);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, "F");
    doc.setTextColor(19, 42, 99);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    writeText("Producto", margin + 5, y + 1);
    writeText("Cantidad", 95, y + 1);
    writeText("Precio", 130, y + 1);
    writeText("Total", 170, y + 1);
    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  drawTableHeader();

  cart.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
      drawTableHeader();
    }
    const unitLabel = item.product.unit === "kg" ? "kg" : "unidad";
    const displayQty = unitLabel === "kg" ? item.quantity.toFixed(1) : Math.round(item.quantity);
    const weightDisplay = ` (${(item.quantity * item.product.weight_per_unit).toFixed(2)} kg)`;
    const unitPrice = item.product.base_price;
    const totalPrice = item.quantity * item.product.base_price;

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, "F");
    }
    writeText(`${item.product.name}${weightDisplay}`, margin + 5, y + 1);
    writeText(`${displayQty} ${unitLabel}`, 95, y + 1);
    writeText(`${unitPrice.toFixed(2)} $`, 130, y + 1);
    writeText(`${totalPrice.toFixed(2)} $`, 170, y + 1);
    y += 8;
  });

  y += 4;
  doc.setDrawColor(19, 42, 99);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const total = cart.reduce((s, i) => s + i.quantity * i.product.base_price, 0);
  const totalWeight = cart.reduce((s, i) => s + i.quantity * i.product.weight_per_unit, 0);

  doc.setFillColor(245, 250, 247);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 35, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(19, 42, 99);
  writeText("RESUMEN DEL PEDIDO", pageWidth / 2, y + 2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const summaryY = y + 12;
  writeText(`Productos: ${cart.length}`, margin + 15, summaryY);
  writeText(`Peso total: ${totalWeight.toFixed(2)} kg`, margin + 80, summaryY);
  writeText(`Total: ${total.toFixed(2)} $`, margin + 145, summaryY);

  y += 35;
  doc.setDrawColor(255, 199, 44);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  writeText("Gracias por tu compra!", pageWidth / 2, y + 2, { align: "center" });
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  writeText(`Pedido #${orderId} - ${fecha}`, pageWidth / 2, y + 2, { align: "center" });
  y += 6;
  writeText("INV. EL REY 2020 - Lacteos del occidente de Falcon", pageWidth / 2, y + 2, { align: "center" });

  return doc;
}

// Subida de PDF en línea sin backend
async function uploadPdfBlob(pdfBlob: Blob): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, `pedido_lacteos_${Date.now()}.pdf`);

    // Petición local a tu propia API en Next.js
    const res = await fetch("/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.link || null;
  } catch (error) {
    console.error("Error al subir el PDF:", error);
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [savedCustomer, setSavedCustomer] = useState<CustomerData | null>(null);
  const [isSending, setIsSending] = useState(false); // Estado para feedback al usuario
  const [toast, setToast] = useState({ show: false, title: "", qtyLabel: "", weight: "0.00", subtotal: "0.00 $" });
  const [totalBumpKey, setTotalBumpKey] = useState(0);
  const [badgeBumpKey, setBadgeBumpKey] = useState(0);

  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTotal = useRef(0);
  const prevCount = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (raw) setSavedCustomer(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const total = cart.reduce((s, i) => s + i.quantity * i.product.base_price, 0);
  const weight = cart.reduce((s, i) => s + i.quantity * i.product.weight_per_unit, 0);
  const count = cart.length;

  useEffect(() => {
    if (total !== prevTotal.current) {
      setTotalBumpKey((k) => k + 1);
      prevTotal.current = total;
    }
    if (count !== prevCount.current) {
      setBadgeBumpKey((k) => k + 1);
      prevCount.current = count;
    }
  }, [total, count]);

  function addToCart(product: Product, qty: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    const unitLabel = product.unit === "kg" ? "kg" : "unidad";
    const qtyDisplay = product.unit === "kg" ? qty.toFixed(1) : String(Math.round(qty));
    const weightTotal = qty * product.weight_per_unit;
    const subtotal = qty * product.base_price;

    setToast({
      show: true,
      title: `✅ ${product.name} añadido`,
      qtyLabel: `${qtyDisplay} ${unitLabel}`,
      weight: weightTotal.toFixed(2),
      subtotal: `${subtotal.toFixed(2)} $`,
    });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2800);
  }

  function openProductModal(product: Product) {
    if (!product.in_stock) return;
    setModalProduct(product);
  }
  function closeProductModal() {
    setModalProduct(null);
  }
  function handleModalAdd(product: Product, qty: number) {
    addToCart(product, qty);
    closeProductModal();
  }

  function updateQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const isKg = item.product.unit === "kg";
        let newQty = item.quantity + delta;
        newQty = isKg ? Math.round(newQty * 10) / 10 : Math.round(newQty);
        if (newQty < 1) newQty = 1;
        return { ...item, quantity: newQty };
      })
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function clearCart() {
    if (cart.length === 0) return;
    if (confirm("¿Estás seguro de vaciar el carrito?")) {
      setCart([]);
    }
  }

  function openCustomerModal() {
    if (cart.length === 0) {
      alert("El carrito está vacío. Agrega productos antes de confirmar.");
      return;
    }
    setIsSidebarOpen(false);
    setCustomerModalOpen(true);
  }

  function closeCustomerModalBack() {
    setCustomerModalOpen(false);
    setIsSidebarOpen(true);
  }

  async function submitCustomerForm(data: CustomerData) {
    setSavedCustomer(data);
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    await sendOrderViaWhatsApp(data);
  }

  async function sendOrderViaWhatsApp(customerData: CustomerData) {
    setIsSending(true);

    const doc = generateOrderPDF(cart, customerData);
    let pdfUrl: string | null = null;

    if (doc) {
      const pdfBlob = doc.output("blob");
      pdfUrl = await uploadPdfBlob(pdfBlob);
    }

    let message = "🧀 *Nuevo Pedido - Lácteos*%0A%0A";
    message += `📅 *Fecha:* ${new Date().toLocaleDateString("es-ES")}%0A%0A`;
    if (customerData.name || customerData.address || customerData.cedula || customerData.phone) {
      message += `👤 *Datos del cliente:*%0A`;
      if (customerData.name) message += `Nombre: ${encodeURIComponent(customerData.name)}%0A`;
      if (customerData.cedula) message += `Cédula: ${encodeURIComponent(customerData.cedula)}%0A`;
      if (customerData.phone) message += `Teléfono: ${encodeURIComponent(customerData.phone)}%0A`;
      if (customerData.address) message += `Dirección: ${encodeURIComponent(customerData.address)}%0A%0A`;
    }

    message += `📋 *Detalle del pedido:*%0A━━━━━━━━━━━━━━━━%0A`;
    cart.forEach((item, index) => {
      const unitLabel = item.product.unit === "kg" ? "kg" : "unidad";
      const displayQty = unitLabel === "kg" ? item.quantity.toFixed(1) : Math.round(item.quantity);
      const weightDisplay = ` (${(item.quantity * item.product.weight_per_unit).toFixed(2)} kg)`;
      message += `${index + 1}. *${encodeURIComponent(item.product.name)}*${weightDisplay}%0A`;
      message += `   Cantidad: ${displayQty} ${unitLabel}%0A`;
      message += `   Precio: ${(item.quantity * item.product.base_price).toFixed(2)} $%0A%0A`;
    });
    message += `━━━━━━━━━━━━━━━━%0A`;
    message += `📦 *Productos: ${cart.length}*%0A`;
    message += `⚖️ *Peso total: ${weight.toFixed(2)} kg*%0A`;
    message += `💰 *TOTAL: ${total.toFixed(2)} $*%0A%0A`;

    if (pdfUrl) {
      message += `📄 *Factura/PDF adjunto:* ${pdfUrl}%0A%0A`;
    }

    message += `✨ Quedo atento a la confirmación de la entrega.`;

    // Redirección directa al número de teléfono especificado
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");

    setIsSending(false);
    setCart([]);
    setCustomerModalOpen(false);
    setIsSidebarOpen(false);
  }

  return (
    <>
      <Navbar cartCount={count} onCartClick={() => setIsSidebarOpen((o) => !o)} />

      <CartContext.Provider value={{ cart, openProductModal }}>
        {children}
      </CartContext.Provider>

      {/* Indicador de carga si está subiendo el PDF */}
      {isSending && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #ffc72c",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: "bold" }}>Generando enlace del PDF y abriendo WhatsApp...</p>
        </div>
      )}

      {/* Toast */}
      <div className={`fab-toast ${toast.show ? "show" : ""}`}>
        <i className="fas fa-circle-check"></i>
        <div className="toast-content">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-sub">
            <span>
              📦 <span className="highlight">{toast.qtyLabel}</span>
            </span>
            <span>
              ⚖️ <span className="highlight">{toast.weight}</span> kg
            </span>
            <span>
              💰 <span className="highlight">{toast.subtotal}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating cart button */}
      <button className="cart-fab" onClick={() => setIsSidebarOpen((o) => !o)}>
        <div className="cart-fab-ring">
          <div className="cart-fab-icon">
            <i className="fas fa-shopping-basket"></i>
            <span
              key={badgeBumpKey}
              className={`fab-badge ${count === 0 ? "hidden" : "pulse"}`}
            >
              {count}
            </span>
          </div>
        </div>
        <div className="fab-info">
          <div className="fab-info-top">
            <div className="fab-details">
              <span>
                <i className="fas fa-tag"></i>
                <span className="detail-value">{count}</span>
                <span className="detail-label">{count === 1 ? "producto" : "productos"}</span>
              </span>
              <span className="fab-divider"></span>
              <span>
                <i className="fas fa-weight-hanging"></i>
                <span className="detail-value">{weight.toFixed(1)}</span>
                <span className="detail-label">kg</span>
              </span>
            </div>
            <span className="fab-total">
              <span className="currency-symbol">$</span>
              <span key={totalBumpKey} className="total-amount bump">
                {total.toFixed(2)}
              </span>
            </span>
          </div>
          <div className="fab-status">
            <span className={`fab-status-dot ${count > 0 ? "has-items" : ""}`}></span>
            <span>{count === 0 ? "Vacío" : `${count} producto${count > 1 ? "s" : ""}`}</span>
          </div>
        </div>
      </button>

      <CartSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onConfirmOrder={openCustomerModal}
      />

      <ProductModal
        product={modalProduct}
        existingQty={
          modalProduct ? cart.find((i) => i.product.id === modalProduct.id)?.quantity ?? 1 : 1
        }
        cartTotal={total}
        onClose={closeProductModal}
        onAdd={handleModalAdd}
      />

      <CustomerModal
        open={customerModalOpen}
        total={total}
        savedCustomer={savedCustomer}
        onClose={closeCustomerModalBack}
        onSubmit={submitCustomerForm}
      />
    </>
  );
}