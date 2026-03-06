const storage = require("../../../../lib/api-storage");
const { buildInvoiceBuffer } = require("../../../../lib/api-utils/helpers");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { id } = req.query;
  const orders = await storage.getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  try {
    const pdfBuffer = await buildInvoiceBuffer(order);
    const settings = await storage.getSettings();

    // Try Resend SDK first
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const fromEmail = settings?.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject: `EKG Logistics and transport — Invoice ${order.id}`,
          html: `<p>Dear ${order.name},</p><p>Please find attached the invoice for your order <b>${order.id}</b>.</p><p>Payment will be collected on delivery.</p><p>Thank you,<br/>EKG Logistics and transport</p>`,
          attachments: [
            {
              filename: `invoice-${order.id}.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        if (!error) return res.json({ ok: true, via: 'resend', data });
        console.error('Invoice Resend Error:', error);
      } catch (err) {
        console.error('Invoice Resend Catch:', err);
      }
    }

    // Fallback to SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return res.status(501).json({ error: "Email service not configured." });
    }

    const fromEmail = settings?.fromEmail || process.env.FROM_EMAIL || smtpUser || "no-reply@ekgtransport.com";
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `EKG Logistics and transport — Invoice ${order.id}`,
      text: `Dear ${order.name},\n\nPlease find attached the invoice for your order ${order.id}. Payment will be collected on delivery.\n\nThank you,\nEKG Logistics and transport`,
      attachments: [
        { filename: `invoice-${order.id}.pdf`, content: pdfBuffer },
      ],
    });

    return res.json({ ok: true, via: 'smtp', info });

  } catch (e) {
    console.error('Invoice Email API Global Error:', e);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
