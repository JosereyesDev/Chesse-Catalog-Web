export interface PDFOrderItem {
  id?: number;
  name: string;
  unit: string;
  weight_per_unit?: number;
  quantity: number;
  base_price: number;
  total_price: number;
}

export interface PDFCustomerData {
  name?: string;
  address?: string;
  cedula?: string;
  phone?: string;
}

export interface PDFOrderData {
  orderNumber: string;
  dateStr?: string;
  customer: PDFCustomerData;
  items: PDFOrderItem[];
  total: number;
  weight: number;
}

export function cleanTextForPDF(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ú: "u",
    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U",
    ñ: "n", Ñ: "N", ü: "u", Ü: "U",
  };
  return text.replace(/[áéíóúÁÉÍÓÚñÑüÜ]/g, (c) => map[c] || c);
}

export function generateInvoicePDF(order: PDFOrderData): any {
  if (typeof window === "undefined" || !window.jspdf) {
    console.error("jsPDF no está disponible en window");
    return null;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  const writeText = (text: string, x: number, yPos: number, options: any = {}) => {
    doc.text(cleanTextForPDF(text), x, yPos, options);
  };

  // Barra superior azul y franja amarilla
  doc.setFillColor(19, 42, 99);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFillColor(255, 199, 44);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo insignia circular
  const logoX = margin;
  const logoY = 10;
  const logoRadius = 14;
  doc.setFillColor(255, 199, 44);
  doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius, "F");
  doc.setFillColor(19, 42, 99);
  doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius - 3, "F");

  // Título marca
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  writeText("INV. EL REY", logoX + 35, logoY + 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 199, 44);
  writeText("LACTEOS DE FALCON - 2020", logoX + 35, logoY + 24);
  doc.setDrawColor(255, 199, 44);
  doc.setLineWidth(0.5);
  doc.line(margin, logoY + 32, pageWidth - margin, logoY + 32);

  // Fecha y número de pedido
  const fecha = order.dateStr || new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const orderId = order.orderNumber;

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

  // Cuadro de datos del cliente
  const customerData = order.customer || {};
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

  // Encabezado de tabla
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

  // Filas de productos
  order.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
      drawTableHeader();
    }
    const unitLabel = item.unit === "kg" ? "kg" : "unidad";
    const displayQty = unitLabel === "kg" ? item.quantity.toFixed(1) : Math.round(item.quantity);
    const weightDisplay = item.weight_per_unit ? ` (${(item.quantity * item.weight_per_unit).toFixed(2)} kg)` : "";

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, "F");
    }

    writeText(`${item.name}${weightDisplay}`, margin + 5, y + 1);
    writeText(`${displayQty} ${unitLabel}`, 95, y + 1);
    writeText(`${Number(item.base_price).toFixed(2)} $`, 130, y + 1);
    writeText(`${Number(item.total_price).toFixed(2)} $`, 170, y + 1);
    y += 8;
  });

  y += 4;
  doc.setDrawColor(19, 42, 99);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Cuadro resumen
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
  writeText(`Productos: ${order.items.length}`, margin + 15, summaryY);
  writeText(`Peso total: ${Number(order.weight).toFixed(2)} kg`, margin + 80, summaryY);
  writeText(`Total: ${Number(order.total).toFixed(2)} $`, margin + 145, summaryY);

  y += 35;
  doc.setDrawColor(255, 199, 44);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  writeText("¡Gracias por tu compra!", pageWidth / 2, y + 2, { align: "center" });
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  writeText(`Pedido #${orderId} - ${fecha}`, pageWidth / 2, y + 2, { align: "center" });
  y += 6;
  writeText("INV. EL REY 2020 - Lacteos del occidente de Falcon", pageWidth / 2, y + 2, { align: "center" });

  return doc;
}
