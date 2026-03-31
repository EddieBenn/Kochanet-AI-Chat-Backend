import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { transporter } from './config/nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(createEmailDto: CreateEmailDto) {
    try {
      const mailOptions = {
        from: createEmailDto.from,
        to: createEmailDto.to,
        subject: createEmailDto.subject,
        html: createEmailDto.body,
      };

      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', createEmailDto.to);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      console.error(
        'Error sending email via Nodemailer:',
        error.message || error,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
