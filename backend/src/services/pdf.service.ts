import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { formatPrice, formatDate } from '../../../frontend/src/utils/helpers'; // Reuse formatters

export const generateReceiptPDF = async (order: any, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the PDF directly to the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.id.slice(0, 8)}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('TheGreat Store', { align: 'center' });
  doc.fontSize(10).text('123 Commerce St, Tech City, TC 12345', { align: 'center' }).moveDown();
  
  doc.fontSize(20).text('Order Receipt', { align: 'center' }).moveDown(2);

  // Order Info
  doc.fontSize(12)
    .text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
    .text(`Status: ${order.status}`)
    .moveDown();

  // Customer Info
  if (order.shippingAddress) {
    doc.text('Shipping To:')
       .fontSize(10)
       .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`)
       .text(`${order.shippingAddress.street}`)
       .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`)
       .moveDown();
  }

  // Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

  // Line Items Header
  let y = doc.y;
  doc.fontSize(12).text('Item', 50, y);
  doc.text('Qty', 350, y);
  doc.text('Price', 400, y);
  doc.text('Total', 500, y);
  doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke().moveDown();

  // Line Items
  doc.fontSize(10);
  order.items.forEach((item: any) => {
    y = doc.y + 10;
    doc.text(item.name.substring(0, 40), 50, y);
    doc.text(item.quantity.toString(), 350, y);
    // Simple format price
    doc.text(`$${item.price.toFixed(2)}`, 400, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 500, y);
  });

  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

  // Totals
  y = doc.y;
  doc.fontSize(10);
  doc.text('Subtotal:', 400, y).text(`$${order.subtotal.toFixed(2)}`, 500, y);
  doc.text('Shipping:', 400, y + 15).text(`$${order.shippingCost.toFixed(2)}`, 500, y + 15);
  doc.text('Tax:', 400, y + 30).text(`$${order.tax.toFixed(2)}`, 500, y + 30);
  
  if (order.discountAmount > 0) {
    doc.text('Discount:', 400, y + 45).text(`-$${order.discountAmount.toFixed(2)}`, 500, y + 45);
    y += 15;
  }

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total:', 400, y + 45).text(`$${order.total.toFixed(2)}`, 500, y + 45);

  doc.font('Helvetica').fontSize(10);
  doc.moveDown(4);
  doc.text('Thank you for shopping at TheGreat!', { align: 'center' });

  // Finalize PDF
  doc.end();
};
