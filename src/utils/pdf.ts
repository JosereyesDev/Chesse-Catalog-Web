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

const PDF_STYLE = {
  navy: [19, 42, 99] as [number, number, number],
  blue: [45, 91, 166] as [number, number, number],
  text: [40, 48, 60] as [number, number, number],
  muted: [110, 120, 135] as [number, number, number],
  border: [220, 226, 234] as [number, number, number],
  background: [245, 248, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  rowAlt: [248, 250, 253] as [number, number, number],
};

export function cleanTextForPDF(text: string): string {
  if (!text) return "";

  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ú: "u",
    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U",
    ñ: "n", Ñ: "N", ü: "u", Ü: "U",
  };

  return String(text).replace(
    /[áéíóúÁÉÍÓÚñÑüÜ]/g,
    (char) => map[char] || char
  );
}

export function generateInvoicePDF(order: PDFOrderData): any {
  if (typeof window === "undefined" || !(window as any).jspdf) {
    console.error("jsPDF no está disponible en window");
    return null;
  }

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 16;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const BOTTOM_LIMIT = 264;

  let y = 18;

  const formatMoney = (value: number): string =>
    `${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} $`;

  const formatNumber = (value: number, decimals = 2): string =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const write = (
    text: string,
    x: number,
    yPos: number,
    options: any = {}
  ) => {
    doc.text(cleanTextForPDF(String(text ?? "")), x, yPos, options);
  };

  const setText = (
    color: [number, number, number],
    size: number,
    bold = false
  ) => {
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(...PDF_STYLE.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos);
  };

  const fecha =
    order.dateStr ||
    new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const orderId = String(order.orderNumber || "S/N");
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  // =========================================================
  // ENCABEZADO CORPORATIVO
  // =========================================================

  const drawCompanyHeader = () => {
    doc.setFillColor(...PDF_STYLE.navy);
    doc.rect(MARGIN, y, 2.5, 17, "F");

    setText(PDF_STYLE.navy, 20, true);
    write("INV. EL REY", MARGIN + 7, y + 7);

    setText(PDF_STYLE.muted, 8.5);
    write("LACTEOS DE FALCON - 2020", MARGIN + 7, y + 13);

    // Separador vertical
    doc.setDrawColor(...PDF_STYLE.border);
    doc.setLineWidth(0.4);
    doc.line(127, y + 1, 127, y + 16);

    // Identificación del pedido
    setText(PDF_STYLE.muted, 7.5, true);
    write("COMPROBANTE DE PEDIDO", PAGE_W - MARGIN, y + 3, {
      align: "right",
    });

    setText(PDF_STYLE.navy, 13, true);
    write(`#${orderId}`, PAGE_W - MARGIN, y + 10, {
      align: "right",
    });

    setText(PDF_STYLE.muted, 8);
    write(`Fecha: ${fecha}`, PAGE_W - MARGIN, y + 16, {
      align: "right",
    });

    y += 23;
    drawLine(y);
    y += 9;
  };

  // =========================================================
  // DATOS DEL CLIENTE
  // =========================================================

  const drawCustomer = () => {
    const fields = [
      { label: "CLIENTE", value: customer.name },
      { label: "CEDULA / RIF", value: customer.cedula },
      { label: "DIRECCION", value: customer.address },
      { label: "TELEFONO", value: customer.phone },
    ].filter((field) => Boolean(field.value));

    if (fields.length === 0) return;

    const leftX = MARGIN + 5;
    const rightX = MARGIN + CONTENT_W / 2 + 3;
    const colW = CONTENT_W / 2 - 12;
    const lineHeight = 8;

    const leftFields = fields.filter((_, i) => i % 2 === 0);
    const rightFields = fields.filter((_, i) => i % 2 === 1);

    const measureColumn = (column: typeof fields) =>
      column.reduce((max, field) => {
        const lines = doc.splitTextToSize(
          cleanTextForPDF(String(field.value)),
          colW
        ).length;

        return Math.max(max, lines);
      }, 1);

    const rowCount = Math.max(
      measureColumn(leftFields),
      measureColumn(rightFields)
    );

    const boxH = 13 + rowCount * lineHeight;

    doc.setFillColor(...PDF_STYLE.background);
    doc.setDrawColor(...PDF_STYLE.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      MARGIN,
      y,
      CONTENT_W,
      boxH,
      2,
      2,
      "FD"
    );

    setText(PDF_STYLE.navy, 8.5, true);
    write("INFORMACION DEL CLIENTE", MARGIN + 5, y + 6);

    const drawColumn = (
      column: typeof fields,
      x: number
    ) => {
      column.forEach((field, index) => {
        const fieldY = y + 13 + index * lineHeight;

        setText(PDF_STYLE.muted, 7, true);
        write(`${field.label}:`, x, fieldY);

        setText(PDF_STYLE.text, 8.5);

        const labelWidth = 23;
        const lines = doc.splitTextToSize(
          cleanTextForPDF(String(field.value)),
          colW - labelWidth
        );

        doc.text(lines, x + labelWidth, fieldY);
      });
    };

    drawColumn(leftFields, leftX);
    drawColumn(rightFields, rightX);

    y += boxH + 9;
  };

  // =========================================================
  // TABLA DE PRODUCTOS
  // =========================================================

  const columns = {
    product: MARGIN + 4,
    quantity: 111,
    price: 149,
    total: PAGE_W - MARGIN - 4,
  };

  const drawTableHeader = () => {
    doc.setFillColor(...PDF_STYLE.navy);
    doc.roundedRect(
      MARGIN,
      y,
      CONTENT_W,
      10,
      1.5,
      1.5,
      "F"
    );

    setText(PDF_STYLE.white, 8, true);

    write("PRODUCTO", columns.product, y + 6.5);
    write("CANT.", columns.quantity, y + 6.5, {
      align: "center",
    });
    write("PRECIO UNIT.", columns.price, y + 6.5, {
      align: "right",
    });
    write("IMPORTE", columns.total, y + 6.5, {
      align: "right",
    });

    y += 13;
  };

  const startNewPage = () => {
    doc.addPage();
    y = 18;

    setText(PDF_STYLE.navy, 12, true);
    write("INV. EL REY", MARGIN, y);

    setText(PDF_STYLE.muted, 8);
    write(`Pedido #${orderId} - Continuacion`, PAGE_W - MARGIN, y, {
      align: "right",
    });

    y += 7;
    drawLine(y);
    y += 7;

    drawTableHeader();
  };

  const drawItem = (item: PDFOrderItem, index: number) => {
    const isWeight = item.unit?.toLowerCase() === "kg";

    const qty = isWeight
      ? formatNumber(item.quantity, 2)
      : formatNumber(Math.round(item.quantity), 0);

    const unitLabel = isWeight ? "kg" : "und.";

    const weightDisplay =
      item.weight_per_unit && item.weight_per_unit > 0
        ? ` (${formatNumber(
            item.quantity * item.weight_per_unit
          )} kg)`
        : "";

    const productName = cleanTextForPDF(
      `${item.name || "Producto sin nombre"}${weightDisplay}`
    );

    const productLines = doc.splitTextToSize(productName, 78);
    const rowH = Math.max(9, productLines.length * 4.5 + 4);

    if (y + rowH > BOTTOM_LIMIT) {
      startNewPage();
    }

    if (index % 2 === 0) {
      doc.setFillColor(...PDF_STYLE.rowAlt);
      doc.rect(MARGIN, y - 3, CONTENT_W, rowH, "F");
    }

    setText(PDF_STYLE.text, 8.5);

    doc.text(productLines, columns.product, y + 2);

    write(`${qty} ${unitLabel}`, columns.quantity, y + 2, {
      align: "center",
    });

    write(formatMoney(item.base_price), columns.price, y + 2, {
      align: "right",
    });

    setText(PDF_STYLE.navy, 8.5, true);
    write(formatMoney(item.total_price), columns.total, y + 2, {
      align: "right",
    });

    y += rowH;

    doc.setDrawColor(...PDF_STYLE.border);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  };

  // =========================================================
  // RESUMEN DEL PEDIDO
  // =========================================================

  const drawSummary = () => {
    const summaryH = 30;

    if (y + summaryH > BOTTOM_LIMIT) {
      doc.addPage();
      y = 25;
    }

    y += 5;

    doc.setFillColor(...PDF_STYLE.background);
    doc.setDrawColor(...PDF_STYLE.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      MARGIN,
      y,
      CONTENT_W,
      summaryH,
      2,
      2,
      "FD"
    );

    setText(PDF_STYLE.muted, 7.5, true);
    write("PRODUCTOS", MARGIN + 5, y + 8);
    write("PESO TOTAL", MARGIN + 47, y + 8);

    setText(PDF_STYLE.navy, 10, true);
    write(String(items.length), MARGIN + 5, y + 17);
    write(
      `${formatNumber(order.weight)} kg`,
      MARGIN + 47,
      y + 17
    );

    const totalX = PAGE_W - MARGIN - 5;

    setText(PDF_STYLE.muted, 7.5, true);
    write("TOTAL DEL PEDIDO", totalX, y + 8, {
      align: "right",
    });

    setText(PDF_STYLE.navy, 16, true);
    write(formatMoney(order.total), totalX, y + 20, {
      align: "right",
    });

    y += summaryH + 10;
  };

  // =========================================================
  // PIE DE PAGINA
  // =========================================================

  const drawFooters = () => {
    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(...PDF_STYLE.border);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, 278, PAGE_W - MARGIN, 278);

      setText(PDF_STYLE.muted, 8);

      write("Gracias por confiar en INV. EL REY", MARGIN, 284);

      write(
        `Pedido #${orderId}  |  Pagina ${page} de ${pageCount}`,
        PAGE_W - MARGIN,
        284,
        { align: "right" }
      );

      setText(PDF_STYLE.muted, 7);
      write(
        "LACTEOS DE FALCON - 2020",
        PAGE_W / 2,
        290,
        { align: "center" }
      );
    }
  };

  // =========================================================
  // GENERACION DEL DOCUMENTO
  // =========================================================

  drawCompanyHeader();
  drawCustomer();
  drawTableHeader();

  items.forEach((item, index) => drawItem(item, index));

  drawSummary();
  drawFooters();

  return doc;
}