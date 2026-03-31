import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { EmailEventEmitterService } from './events/email-event-emitter.service';

@Module({
  imports: [EmailModule],
  providers: [EmailEventEmitterService],
  exports: [EmailEventEmitterService],
})
export class CommonModule {}
