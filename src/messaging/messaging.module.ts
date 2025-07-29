import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { RabbitMQService } from './rabbit-mq/rabbit-mq.service';

@Module({
  providers: [
    {
      provide: MessagingService,
      useClass: RabbitMQService,
    },
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
