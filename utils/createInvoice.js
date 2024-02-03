const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

function createInvoice(invoice, path) {
  return new Promise((resolve, reject) => {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    const stream = doc.pipe(fs.createWriteStream(path));
    stream.on("finish", () => {
      resolve(path);
    });
    doc.end();
  });
}

function generateHeader(doc) {
  const logoPath = path.join(
    path.dirname(require.main.filename),
    "public",
    "img",
    "VSHOP-LOGO-transformed.png"
  );
  doc
    .image(logoPath, 50, 45, { width: 100, scale: 0.25 })
    .fillColor("#444444")
    .fontSize(10)
    .text("VShop", 200, 50, { align: "right" })
    .text("Lokhandwala, Kandivali East", 200, 65, { align: "right" })
    .text("Mumbai, Maharashtra, India", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice._id, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)

    .font("Helvetica-Bold")
    .text(invoice.userData.username, 300, customerInformationTop)
    .font("Helvetica")
    .text("Street Address", 300, customerInformationTop + 15)
    .text(
      invoice.userData.shippingDetails.shipping_address,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;
  const total = invoice.products.reduce(
    (total, { productData, quantity }) =>
      total + productData.productPrice * quantity,
    0
  );

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.products.length; i++) {
    const item = invoice.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.productData.productTitle,
      item.productData.productDescription,
      formatCurrency(item.productData.productPrice),
      item.quantity,
      formatCurrency(item.productData.productPrice * item.quantity)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(total)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "GST (if applicable)",
    "",
    formatCurrency(0)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Total",
    "",
    formatCurrency(total)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text("Copyrights Vshop, 2024", 50, 780, { align: "center", width: 500 });
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return "$" + cents.toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice,
};
