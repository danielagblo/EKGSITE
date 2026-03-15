const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

/**
 * Sends an email using the Gmail API.
 * Requires GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
 * and GMAIL_USER in the environment variables.
 * @param {Object} options 
 * @param {string} options.to
 * @param {string} options.from
 * @param {string} [options.replyTo]
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {Array<{filename: string, content: Buffer|string}>} [options.attachments]
 */
async function sendViaGmailApi({ to, from, replyTo, subject, text, html, attachments }) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.GMAIL_USER || 'me';

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Gmail API credentials in environment.');
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground' // default redirect URI
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  // Use MailComposer from nodemailer to safely build RFC 822 / MIME encoded messages
  const mailOptions = {
    to,
    from,
    replyTo,
    subject,
    text,
    html,
    attachments,
  };

  const mail = new MailComposer(mailOptions);
  const messageBuffer = await mail.compile().build();

  // The Gmail API requires base64url encoding
  const encodedMessage = Buffer.from(messageBuffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: user,
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data;
}

module.exports = { sendViaGmailApi };
