import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Cannot send email - SENDGRID_API_KEY not configured");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendContactFormEmail(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const emailContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
    <p><strong>Subject:</strong> ${formData.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${formData.message.replace(/\n/g, '<br>')}</p>
  `;

  return await sendEmail({
    to: 'info@robertsoneducation.com',
    from: 'info@robertsoneducation.com',
    subject: `Contact Form: ${formData.subject}`,
    html: emailContent,
    text: `
      New Contact Form Submission
      Name: ${formData.firstName} ${formData.lastName}
      Email: ${formData.email}
      ${formData.phone ? `Phone: ${formData.phone}` : ''}
      Subject: ${formData.subject}
      Message: ${formData.message}
    `
  });
}