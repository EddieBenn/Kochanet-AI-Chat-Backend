import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { EmailEventsEnum } from 'src/base.entity';
import { CreateEmailDto } from 'src/email/dto/create-email.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class EmailEventEmitterService {
  private readonly eventEmitter = new EventEmitter();

  constructor(private readonly emailService: EmailService) {}

  emitEmailEvent(data: CreateEmailDto, eventName: EmailEventsEnum): void {
    const listeners = this.eventEmitter.listeners(eventName);
    if (listeners.length === 0) {
      this.eventEmitter.on(eventName, (emailData: CreateEmailDto) => {
        this.emailService.sendEmail(emailData).catch((err: unknown) => {
          console.error('Failed to send email:', err);
        });
      });
    }
    this.eventEmitter.emit(eventName, data);
  }
}
