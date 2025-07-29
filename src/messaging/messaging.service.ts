import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MessagingService {
  abstract OnModuleInit(): Promise<void>;
  abstract onModuleDestroy(): Promise<void>;

  abstract publishEvent(queueName: string, event: unknown);
}
