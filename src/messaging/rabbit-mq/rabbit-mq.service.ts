import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    try {
      const rabbitMqUrl = process.env.RABBITMQ_URL;
      if (!rabbitMqUrl)
        throw new Error(
          'The RABBITMQ_URL environment variable must be defined.',
        );
      this.connection = await amqp.connect(rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      console.info('Successfully connected to RabbitMQ');
    } catch (err) {
      console.error('Failed to connect RabbitMQ:', err);
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  publishEvent(queueName: string, event: unknown): void {
    if (!this.channel) {
      console.error(
        'RabbitMQ channel is not available. The message not published.',
      );
      return;
    }

    this.channel.assertQueue(queueName, { durable: true });
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
    console.info(`[X] Event sent to queue ${queueName}:`, event);
  }
}
