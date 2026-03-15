const storage = require('../../lib/api-storage')
const nodemailer = require('nodemailer')
const { sendViaGmailApi } = require('../../lib/api-utils/gmail')
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).end('Method Not Allowed')
    }

    const { name, email, subject, message } = req.body || {}

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields (name, email, message)' })
    }

    try {
        const settings = await storage.getSettings()
        const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL || process.env.FROM_EMAIL

        if (!adminEmail) {
            console.error('Contact Email Error: No admin recipient configured.')
            return res.status(500).json({ error: 'System configuration error: No recipient email.' })
        }

        // Try Gmail API First
        const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
        if (gmailClientSecret) {
            try {
                const fromEmail = settings?.fromEmail || process.env.FROM_EMAIL || 'me'

                await sendViaGmailApi({
                    from: fromEmail,
                    to: adminEmail,
                    replyTo: email,
                    subject: `Contact Form Inquiry: ${subject || 'New Message'} - from ${name}`,
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
                            <h2 style="color: #D4AF37;">New Inquiry from EKG Site</h2>
                            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                            <hr style="border: 0; border-top: 1px solid #eee;" />
                            <p><strong>Message:</strong></p>
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #D4AF37;">
                                ${message.replace(/\n/g, '<br/>')}
                            </div>
                        </div>
                    `
                })

                return res.status(200).json({ ok: true, message: 'Message sent via Gmail API' })
            } catch (gmailErr) {
                console.error('Gmail API Contact Catch:', gmailErr)
            }
        }

        // Fallback to SMTP
        const smtpHost = process.env.SMTP_HOST
        const smtpPort = process.env.SMTP_PORT
        const smtpUser = process.env.SMTP_USER
        const smtpPass = process.env.SMTP_PASS

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            return res.status(500).json({ error: 'Email service not configured.' })
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: { user: smtpUser, pass: smtpPass }
        })

        const fromEmail = settings?.fromEmail || process.env.FROM_EMAIL || smtpUser
        await transporter.sendMail({
            from: `"EKG Contact Form" <${fromEmail}>`,
            to: adminEmail,
            replyTo: email,
            subject: `Contact Form: ${subject || 'New Inquiry'} from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`
        })

        return res.status(200).json({ ok: true, message: 'Message sent via SMTP' })

    } catch (error) {
        console.error('Contact API Error:', error)
        return res.status(500).json({ error: 'Failed to send message. Please try again later.' })
    }
}
