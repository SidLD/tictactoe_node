import Queue from 'bull';
import nodeMailer from 'nodemailer';
import EmailTemplates from 'swig-email-templates';
import path from 'path';
import htmlpdf from 'html-pdf';
import CONFIG from '../config/vars';

const emailLayouts = new EmailTemplates({
  root: `${process.cwd()}/src/api`,
  juice: {
    webResources: {
      applyStyleTags: true,
      relativeTo: path.join(__dirname, '..', 'assets'),
    },
  },
});

const transporter = nodeMailer.createTransport({
  host: CONFIG.SEND_BLUE.HOST,
  port: CONFIG.SEND_BLUE.PORT,
  auth: {
    user: CONFIG.SEND_BLUE.APIKEY,
    pass: CONFIG.SEND_BLUE.API_SECRET,
  },
});

export class EmailQueue {
  private queue: Queue.Queue;

  constructor() {
    this.queue = new Queue('emailQueue', 'redis://127.0.0.1:6379');
    this.queue.process('sendEmail', this.sendEmail.bind(this));  // worker process
    this.queue.process('sendEmailWithAttachment', this.sendEmailWithAttachment.bind(this));  // worker for attachments
  }

  // Send Email with PDF Attachment
  private async sendEmailWithAttachment(job: any) {
    const { to, subject, messagePath, pdfFilePath } = job.data;
    try {
      console.log('Sending email with attachment...');

      // Render HTML template
      const html = await this.renderTemplate(messagePath, job.data);

      const mailOptions = {
        from: `test <${CONFIG.email.mailjet.SENDER}>`,
        to,
        subject,
        html,
        attachments: pdfFilePath ? [
          {
            filename: path.basename(pdfFilePath),
            path: pdfFilePath,
            contentType: 'application/pdf',
          }
        ] : []
      };

      // Send email
      const response = await this.sendMail(mailOptions);
      job.moveToCompleted('done', true);
      return response;
    } catch (error) {
      console.error(error);
      job.moveToFailed({ message: 'Error sending email with attachment' });
      throw error;
    }
  }

  // Send Basic Email
  private async sendEmail(job: any) {
    const { to, subject, messagePath } = job.data;
    try {
      console.log('Sending basic email...');

      // Render HTML template
      const html = await this.renderTemplate(messagePath, job.data);

      const mailOptions = {
        from: `test <${CONFIG.email.mailjet.SENDER}>`,
        to,
        subject,
        html,
      };

      // Send email
      const response = await this.sendMail(mailOptions);
      job.moveToCompleted('done', true);
      return response;
    } catch (error) {
      console.error(error);
      job.moveToFailed({ message: 'Error sending email' });
      throw error;
    }
  }

  // Helper method to render templates using swig-email-templates
  private renderTemplate(messagePath: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      emailLayouts.render(messagePath, data, (error: any, html: string) => {
        if (error) {
          return reject(error);
        }
        resolve(html);
      });
    });
  }

  // Helper method to send email using nodeMailer
  private sendMail(mailOptions: any): Promise<any> {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          return reject(error);
        }
        console.log(`Email sent: ${info.response}`);
        resolve(info);
      });
    });
  }

  // Add Email Job to Queue
  addEmailToQueue(processName: string, data: any) {
    const jobOptions = {
      removeOnComplete: true,
      delay: 100,
      attempts: 3,
    };

    console.log("Adding email to queue...");
    this.queue.add(processName, data, jobOptions);
  }

  // Add Email Job with Attachment to Queue
  addEmailWithAttachmentToQueue(processName: string, data: any) {
    const jobOptions = {
      removeOnComplete: true,
      delay: 100,
      attempts: 3,
    };

    console.log("Adding email with attachment to queue...");
    this.queue.add(processName, data, jobOptions);
  }

  // Generate PDF and add attachment
  private generatePdf(html: string): Promise<string> {
    return new Promise((resolve, reject) => {
      htmlpdf.create(html, { format: 'Legal' }).toFile('./assets/pdfs/output.pdf', (err: any, res: { filename: string }) => {
        if (err) {
          return reject(err);
        }
        resolve(res.filename);
      });
    });
  }
}
