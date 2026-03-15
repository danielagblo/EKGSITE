const nodemailer = require('nodemailer')
const { sendViaGmailApi } = require('./gmail')
const storage = require('../api-storage')
const { buildInvoiceBuffer } = require('./helpers')

function buildAdminOrderSms(order) {
  const id = order?.id || '-'
  const customer = order?.name || 'Unknown customer'
  const phone = order?.phone || '-'
  const product = order?.productName || order?.model || order?.product || 'Vehicle'
  const location = order?.location || '-'
  const note = order?.note ? ` Notes: ${order.note}` : ''
  const dates = `${order?.start || '-'} to ${order?.end || '-'}`
  return `New order ${id}. Customer: ${customer}. Phone: ${phone}. Vehicle: ${product}. Pickup: ${location}. Dates: ${dates}.${note}`
}

async function sendAdminOrderSms(order) {
  const settings = await storage.getSettings()
  const provider = (process.env.SMS_PROVIDER || 'paystack').toLowerCase()
  const adminSmsNumber = settings.adminSmsNumber || process.env.ADMIN_SMS_NUMBER

  if (!adminSmsNumber) return { ok: false, skipped: true, reason: 'Missing ADMIN_SMS_NUMBER' }
  const message = buildAdminOrderSms(order)

  if (provider === 'arkesel') {
    const key = process.env.ARKESEL_API_KEY
    const sender = process.env.ARKESEL_SENDER || 'EKG'
    if (!key) return { ok: false, skipped: true, reason: 'Missing ARKESEL_API_KEY' }

    const baseUrl = 'https://sms.arkesel.com/sms/api'
    const params = new URLSearchParams({
      action: 'send-sms',
      api_key: key,
      to: adminSmsNumber.replace(/\+/g, '').trim(),
      from: sender,
      sms: message
    })

    const url = `${baseUrl}?${params.toString()}`
    const resp = await fetch(url)
    const text = await resp.text()

    if (!resp.ok) throw new Error(`Arkesel SMS gateway returned ${resp.status}: ${text.slice(0, 300)}`)
    return { ok: true, text }
  }

  // fallback paystack
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
  const paystackSmsUrl = process.env.PAYSTACK_SMS_URL
  const sender = process.env.PAYSTACK_SMS_SENDER || 'EKG Logistics'
  if (!paystackSecretKey || !paystackSmsUrl) return { ok: false, skipped: true, reason: 'Missing PAYSTACK_SECRET_KEY or PAYSTACK_SMS_URL' }
  const payload = { to: adminSmsNumber, from: sender, message, body: message, sms: message }
  const r = await fetch(paystackSmsUrl, { method: 'POST', headers: { Authorization: `Bearer ${paystackSecretKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const text = await r.text()
  if (!r.ok) throw new Error(`SMS gateway returned ${r.status}: ${text.slice(0, 300)}`)
  return { ok: true, text }
}

async function sendAdminOrderEmail(order) {
  const settings = await storage.getSettings()
  const adminEmail = settings.adminEmail || process.env.ADMIN_EMAIL || process.env.FROM_EMAIL
  if (!adminEmail) return { ok: false, skipped: true, reason: 'Missing ADMIN_EMAIL' }

  // Try Gmail API first (Bypass SMTP restrictions)
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
  if (gmailClientSecret) {
    try {
      const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || 'me'
      const text = `New order ${order.id}\nCustomer: ${order.name}\nPhone: ${order.phone || '-'}\nEmail: ${order.email || '-'}\nProduct: ${order.productName || order.product || '-'}\nPickup: ${order.location || '-'}\nDates: ${order.start || '-'} to ${order.end || '-'}\nNotes: ${order.note || '-'}\n\nView in admin dashboard.`

      const data = await sendViaGmailApi({
        from: fromEmail,
        to: adminEmail,
        subject: `New order ${order.id} - ${order.name}`,
        text: text
      })

      return { ok: true, via: 'gmail', data }
    } catch (e) {
      console.error('Admin Gmail API catch Error', e)
    }
  }

  // Fallback to SMTP
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) return { ok: false, skipped: true, reason: 'SMTP/API not configured' }

  const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || smtpUser || 'no-reply@example.com'
  const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(smtpPort), secure: Number(smtpPort) === 465, auth: { user: smtpUser, pass: smtpPass } })

  const text = `New order ${order.id}\nCustomer: ${order.name}\nPhone: ${order.phone || '-'}\nEmail: ${order.email || '-'}\nProduct: ${order.productName || order.product || '-'}\nPickup: ${order.location || '-'}\nDates: ${order.start || '-'} to ${order.end || '-'}\nNotes: ${order.note || '-'}\n\nView in admin dashboard.`

  const info = await transporter.sendMail({ from: fromEmail, to: adminEmail, subject: `New order ${order.id}`, text })
  return { ok: true, info }
}

async function sendCustomerOrderSms(order) {
  if (!order.phone) return { ok: false, skipped: true, reason: 'Missing customer phone' }
  const provider = (process.env.SMS_PROVIDER || 'paystack').toLowerCase()
  const message = `Hello ${order.name}, thank you for your order ${order.id} for the ${order.productName || 'vehicle'}. Pickup point: ${order.location || 'to be confirmed'}. We have received your request and will contact you shortly. EKG Logistics.`

  try {
    if (provider === 'arkesel') {
      const key = process.env.ARKESEL_API_KEY
      const sender = process.env.ARKESEL_SENDER || 'EKG'
      if (!key) return { ok: false, skipped: true }
      const baseUrl = 'https://sms.arkesel.com/sms/api'
      const params = new URLSearchParams({ action: 'send-sms', api_key: key, to: order.phone.replace(/\+/g, '').trim(), from: sender, sms: message })
      const url = `${baseUrl}?${params.toString()}`
      const resp = await fetch(url)
      return { ok: resp.ok, text: await resp.text() }
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    const paystackSmsUrl = process.env.PAYSTACK_SMS_URL
    if (!paystackSecretKey || !paystackSmsUrl) return { ok: false, skipped: true }
    const payload = { to: order.phone, from: process.env.PAYSTACK_SMS_SENDER || 'EKG Logistics', message }
    const r = await fetch(paystackSmsUrl, { method: 'POST', headers: { Authorization: `Bearer ${paystackSecretKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    return { ok: r.ok, text: await r.text() }
  } catch (e) {
    console.error('Customer SMS notification error', e)
    return { ok: false, error: e.message }
  }
}

async function sendCustomerOrderEmail(order) {
  if (!order.email) return { ok: false, skipped: true, reason: 'Missing customer email' }
  const settings = await storage.getSettings()

  // Try Gmail API first (Bypass SMTP restrictions)
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
  if (gmailClientSecret) {
    try {
      const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || 'me'
      const invoiceBuffer = await buildInvoiceBuffer(order)

      const data = await sendViaGmailApi({
        from: fromEmail,
        to: order.email,
        subject: `Your EKG Rental Confirmation - Order #${order.id}`,
        html: `<p>Hello ${order.name},</p><p>Thank you for choosing EKG Logistics. We have received your rental request for the <b>${order.productName}</b> (Order #${order.id}).</p><p>Our team will contact you shortly.</p>`,
        attachments: [
          {
            filename: `invoice-${order.id}.pdf`,
            content: invoiceBuffer
          }
        ]
      })

      return { ok: true, via: 'gmail', data }
    } catch (e) {
      console.error('Customer Gmail API catch Error', e)
    }
  }

  // Fallback to SMTP (will fail on restricted hosts)
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) return { ok: false, skipped: true, reason: 'SMTP/API not configured' }

  const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || smtpUser || 'no-reply@example.com'
  const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(smtpPort), secure: Number(smtpPort) === 465, auth: { user: smtpUser, pass: smtpPass } })

  const text = `Hello ${order.name},\n\nThank you for choosing EKG Logistics and Transport. We have received your rental request for the ${order.productName || 'vehicle'} (Order #${order.id}).\n\nOur team will contact you shortly.\n\nBest regards,\nEKG Logistics Team`

  try {
    const invoiceBuffer = await buildInvoiceBuffer(order)
    const info = await transporter.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `Your EKG Rental Confirmation - Order #${order.id}`,
      text,
      attachments: [{ filename: `invoice-${order.id}.pdf`, content: invoiceBuffer }]
    })
    return { ok: true, info }
  } catch (e) {
    console.error('SMTP error', e)
    return { ok: false, error: e.message }
  }
}

async function sendApprovalSms(order) {
  if (!order.phone) return { ok: false, skipped: true, reason: 'Missing customer phone' }
  const provider = (process.env.SMS_PROVIDER || 'paystack').toLowerCase()
  const message = `Congratulations ${order.name}! Your EKG Logistics rental (Order #${order.id}) has been APPROVED. Our chauffeur will be at your location: ${order.location || 'Accra'} at the scheduled time. Link to order: https://ekgsite.com/my-orders. Drive in luxury.`

  try {
    if (provider === 'arkesel') {
      const key = process.env.ARKESEL_API_KEY
      const sender = process.env.ARKESEL_SENDER || 'EKG'
      if (!key) return { ok: false, skipped: true }
      const baseUrl = 'https://sms.arkesel.com/sms/api'
      const params = new URLSearchParams({ action: 'send-sms', api_key: key, to: order.phone.replace(/\+/g, '').trim(), from: sender, sms: message })
      const url = `${baseUrl}?${params.toString()}`
      const resp = await fetch(url)
      return { ok: resp.ok, text: await resp.text() }
    }
    return { ok: false, skipped: true, reason: 'Provider not configured for approval' }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function sendApprovalEmail(order) {
  if (!order.email) return { ok: false, skipped: true, reason: 'Missing customer email' }
  const settings = await storage.getSettings()

  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
  if (gmailClientSecret) {
    try {
      const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || 'me'
      const data = await sendViaGmailApi({
        from: fromEmail,
        to: order.email,
        subject: `Approved: Your EKG Rental Booking - Order #${order.id}`,
        html: `<p>Hello ${order.name},</p><p>We are pleased to inform you that your rental request (Order #${order.id}) for the <b>${order.productName}</b> has been <b>APPROVED</b>.</p><p>Our team is now finalizing the logistics for your chauffeur and vehicle.</p><p>Scheduled Dates: ${order.start} to ${order.end}</p><p>You can track your orders here: https://ekgsite.com/my-orders</p><br/><p>Best regards,<br/>EKG Logistics Team</p>`
      })
      return { ok: true, via: 'gmail', data }
    } catch (e) {
      console.error('Gmail API Approval Error', e)
    }
  }

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) return { ok: false, skipped: true, reason: 'SMTP/API not configured' }

  const fromEmail = settings.fromEmail || process.env.FROM_EMAIL || smtpUser || 'no-reply@example.com'
  const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(smtpPort), secure: Number(smtpPort) === 465, auth: { user: smtpUser, pass: smtpPass } })

  const text = `Hello ${order.name},\n\nWe are pleased to inform you that your rental request (Order #${order.id}) for the ${order.productName} has been APPROVED.\n\nOur team is now finalizing the logistics for your chauffeur and vehicle. \n\nScheduled Dates: ${order.start} to ${order.end}\nLocation: ${order.location || 'As specified'}\n\nYou can track your orders here: https://ekgsite.com/my-orders\n\nThank you for choosing EKG Logistics.\n\nBest regards,\nEKG Logistics Team`

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `Approved: Your EKG Rental Booking - Order #${order.id}`,
      text
    })
    return { ok: true, info }
  } catch (e) {
    console.error('Approval SMTP error', e)
    return { ok: false, error: e.message }
  }
}

module.exports = {
  sendAdminOrderSms,
  sendAdminOrderEmail,
  sendCustomerOrderSms,
  sendCustomerOrderEmail,
  sendApprovalSms,
  sendApprovalEmail
}
